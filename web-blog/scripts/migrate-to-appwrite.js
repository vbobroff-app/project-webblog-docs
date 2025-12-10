/**
 * Скрипт миграции данных из Firebase в AppWrite
 * 
 * Использование:
 * 1. Открой https://appwrite.infra-net.pro в браузере
 * 2. Открой DevTools (F12) → Console
 * 3. Вставь содержимое этого файла и нажми Enter
 * 4. Вызови: await migrate()
 */

// =============== КОНФИГУРАЦИЯ ===============
const APPWRITE_CONFIG = {
  endpoint: 'https://appwrite.infra-net.pro/v1',
  projectId: '6937b038000f7bcebebd',
  databaseId: '6937e2a1003e415aa8d4',
  collections: {
    posts: '6937e2e8002f4a8f10b4',
    hubs: '6937e4ba003b05696c97'
  }
};

// =============== ДАННЫЕ ИЗ FIREBASE ===============
// Вставь сюда JSON экспорт из Firebase
const FIREBASE_EXPORT = /* ВСТАВЬ JSON ЗДЕСЬ */ null;

// =============== ФУНКЦИИ МИГРАЦИИ ===============

/**
 * Преобразование поста из Firebase в формат AppWrite
 */
function transformPost(firebaseId, post) {
  return {
    // Сохраняем старый ID для маппинга
    _oldId: firebaseId,
    // Поля AppWrite
    author: post.author || 'Unknown',
    title: post.title || '',
    description: post.description || '',
    text: post.text || '',
    icon: post.icon || null,
    count: String(post.count || 0),
    watched: post.watched ? new Date(post.watched).toISOString() : null,
    // hubs в Firebase хранятся как объект {hubName: true}
    hubs: post.hubs ? Object.keys(post.hubs) : []
  };
}

/**
 * Преобразование хаба из Firebase в формат AppWrite
 */
function transformHub(firebaseId, hub) {
  return {
    _oldId: firebaseId,
    name: hub.name || '',
    description: hub.description || '',
    // posts будут заполнены после создания постов
    posts: []
  };
}

/**
 * Создание документа в AppWrite через REST API
 */
async function createDocument(collectionId, data, documentId = null) {
  const url = `${APPWRITE_CONFIG.endpoint}/databases/${APPWRITE_CONFIG.databaseId}/collections/${collectionId}/documents`;
  
  const body = {
    documentId: documentId || 'unique()',
    data: data,
    permissions: ['read("any")']
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': APPWRITE_CONFIG.projectId,
    },
    credentials: 'include', // Используем текущую сессию консоли AppWrite
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create document: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Обновление документа в AppWrite
 */
async function updateDocument(collectionId, documentId, data) {
  const url = `${APPWRITE_CONFIG.endpoint}/databases/${APPWRITE_CONFIG.databaseId}/collections/${collectionId}/documents/${documentId}`;
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': APPWRITE_CONFIG.projectId,
    },
    credentials: 'include',
    body: JSON.stringify({ data })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to update document: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Основная функция миграции
 */
async function migrate() {
  if (!FIREBASE_EXPORT) {
    console.error('❌ FIREBASE_EXPORT не задан! Вставь JSON экспорт в переменную FIREBASE_EXPORT');
    return;
  }

  console.log('🚀 Начинаем миграцию...');
  
  const idMapping = {
    posts: {}, // oldId -> newId
    hubs: {}   // oldId -> newId
  };

  // 1. Миграция постов
  console.log('\n📝 Миграция постов...');
  const posts = FIREBASE_EXPORT.posts || {};
  let postCount = 0;
  
  for (const [oldId, post] of Object.entries(posts)) {
    try {
      const transformed = transformPost(oldId, post);
      delete transformed._oldId; // Убираем служебное поле
      
      const created = await createDocument(APPWRITE_CONFIG.collections.posts, transformed);
      idMapping.posts[oldId] = created.$id;
      postCount++;
      console.log(`  ✅ Пост "${transformed.title.substring(0, 30)}..." → ${created.$id}`);
    } catch (error) {
      console.error(`  ❌ Ошибка поста ${oldId}:`, error.message);
    }
  }
  console.log(`📝 Создано постов: ${postCount}`);

  // 2. Миграция хабов
  console.log('\n🏷️ Миграция хабов...');
  const hubs = FIREBASE_EXPORT.hubs || {};
  let hubCount = 0;
  
  for (const [oldId, hub] of Object.entries(hubs)) {
    try {
      const transformed = transformHub(oldId, hub);
      delete transformed._oldId;
      
      // Преобразуем старые ID постов в новые
      const oldPostIds = hub.posts ? Object.keys(hub.posts) : [];
      transformed.posts = oldPostIds
        .map(oldPostId => idMapping.posts[oldPostId])
        .filter(newId => newId); // Убираем undefined
      
      const created = await createDocument(APPWRITE_CONFIG.collections.hubs, transformed);
      idMapping.hubs[oldId] = created.$id;
      hubCount++;
      console.log(`  ✅ Хаб "${transformed.name}" → ${created.$id} (постов: ${transformed.posts.length})`);
    } catch (error) {
      console.error(`  ❌ Ошибка хаба ${oldId}:`, error.message);
    }
  }
  console.log(`🏷️ Создано хабов: ${hubCount}`);

  console.log('\n✅ Миграция завершена!');
  console.log('📊 Маппинг ID:', idMapping);
  
  return idMapping;
}

// Экспорт для использования
console.log('📦 Скрипт миграции загружен.');
console.log('👉 Вызови: await migrate()');

