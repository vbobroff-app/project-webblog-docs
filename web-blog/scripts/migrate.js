/**
 * Node.js скрипт миграции данных из Firebase в AppWrite
 * Запуск: node scripts/migrate.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// =============== КОНФИГУРАЦИЯ ===============
const APPWRITE_CONFIG = {
  host: 'appwrite.infra-net.pro',
  projectId: '6937b038000f7bcebebd',
  databaseId: '6937e2a1003e415aa8d4',
  collections: {
    posts: '6937e2e8002f4a8f10b4',
    hubs: '6937e4ba003b05696c97',
    info: '69382555000b77835a7a'
  },
  apiKey: process.env.APPWRITE_API_KEY || 'ВСТАВЬ_API_KEY_СЮДА'
};

// =============== ФУНКЦИИ ===============

function makeRequest(method, urlPath, data) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    
    const options = {
      hostname: APPWRITE_CONFIG.host,
      port: 80,
      path: urlPath,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': APPWRITE_CONFIG.projectId,
        'X-Appwrite-Key': APPWRITE_CONFIG.apiKey,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(JSON.stringify(json)));
          }
        } catch (e) {
          reject(new Error(body));
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function createDocument(collectionId, docData, documentId = 'unique()') {
  const urlPath = `/v1/databases/${APPWRITE_CONFIG.databaseId}/collections/${collectionId}/documents`;
  
  const body = {
    documentId: documentId,
    data: docData,
    permissions: ['read("any")']
  };

  return makeRequest('POST', urlPath, body);
}

function transformPost(firebaseId, post) {
  // icon - base64 картинка, может быть очень большой
  let icon = null;
  if (post.icon && typeof post.icon === 'string') {
    icon = post.icon;
  }
  
  return {
    author: post.author || 'Unknown',
    title: post.title || '',
    description: post.description || '',
    text: post.text || '',
    icon: icon,
    count: String(post.count || 0),
    watched: post.watched ? new Date(post.watched).toISOString() : null,
    hubs: post.hubs ? Object.keys(post.hubs) : []
  };
}

function transformHub(firebaseId, hub, postIdMapping) {
  const oldPostIds = hub.posts ? Object.keys(hub.posts) : [];
  const newPostIds = oldPostIds
    .map(oldId => postIdMapping[oldId])
    .filter(Boolean);
    
  return {
    name: hub.name || '',
    description: hub.description || '',
    posts: newPostIds
  };
}

function transformInfo(firebaseId, info) {
  return {
    view: parseInt(info.view) || 0,
    like: parseInt(info.like) || 0,
    comment: parseInt(info.comment) || 0,
    showed: info.showed || null
  };
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function migrate() {
  console.log('🚀 Миграция Firebase → AppWrite');
  console.log('================================\n');

  // Читаем файл экспорта
  const exportPath = path.join(__dirname, '..', 'web-blog-726ee-export.json');
  console.log('📂 Читаем:', exportPath);
  
  const data = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
  
  const idMapping = { posts: {}, hubs: {}, info: {} };

  // 1. Миграция постов
  console.log('\n📝 ПОСТЫ\n');
  const posts = data.posts || {};
  const postEntries = Object.entries(posts);
  let postCount = 0;
  
  for (let i = 0; i < postEntries.length; i++) {
    const [oldId, post] = postEntries[i];
    try {
      const transformed = transformPost(oldId, post);
      const created = await createDocument(APPWRITE_CONFIG.collections.posts, transformed);
      idMapping.posts[oldId] = created.$id;
      postCount++;
      console.log(`✅ [${i+1}/${postEntries.length}] "${transformed.title.substring(0, 35)}..." → ${created.$id}`);
      await sleep(100); // Небольшая пауза между запросами
    } catch (error) {
      console.error(`❌ ${oldId}: ${error.message}`);
    }
  }
  console.log(`\n📊 Постов создано: ${postCount}\n`);

  // 2. Миграция хабов
  console.log('🏷️ ХАБЫ\n');
  const hubs = data.hubs || {};
  const hubEntries = Object.entries(hubs);
  let hubCount = 0;
  
  for (let i = 0; i < hubEntries.length; i++) {
    const [oldId, hub] = hubEntries[i];
    try {
      const transformed = transformHub(oldId, hub, idMapping.posts);
      const created = await createDocument(APPWRITE_CONFIG.collections.hubs, transformed);
      idMapping.hubs[oldId] = created.$id;
      hubCount++;
      console.log(`✅ [${i+1}/${hubEntries.length}] "${transformed.name}" → ${created.$id} (${transformed.posts.length} постов)`);
      await sleep(100);
    } catch (error) {
      console.error(`❌ ${oldId}: ${error.message}`);
    }
  }
  console.log(`\n📊 Хабов создано: ${hubCount}\n`);

  // 3. Миграция info (статистика просмотров)
  console.log('📊 INFO (статистика)\n');
  const infos = data.info || {};
  const infoEntries = Object.entries(infos);
  let infoCount = 0;
  
  for (let i = 0; i < infoEntries.length; i++) {
    const [oldPostId, info] = infoEntries[i];
    const newPostId = idMapping.posts[oldPostId];
    
    if (!newPostId) {
      console.log(`⚠️  [${i+1}/${infoEntries.length}] Пропуск - пост ${oldPostId} не найден`);
      continue;
    }
    
    try {
      const transformed = transformInfo(oldPostId, info);
      // Используем ID поста как ID документа info (связь 1:1)
      const created = await createDocument(APPWRITE_CONFIG.collections.info, transformed, newPostId);
      idMapping.info[oldPostId] = created.$id;
      infoCount++;
      console.log(`✅ [${i+1}/${infoEntries.length}] post:${newPostId} → views:${transformed.view}`);
      await sleep(100);
    } catch (error) {
      console.error(`❌ ${oldPostId}: ${error.message}`);
    }
  }
  console.log(`\n📊 Info создано: ${infoCount}`);

  console.log('\n================================');
  console.log('✅ МИГРАЦИЯ ЗАВЕРШЕНА!');
  console.log(`   📝 Постов: ${postCount}`);
  console.log(`   🏷️  Хабов: ${hubCount}`);
  console.log(`   📊 Info: ${infoCount}`);
  console.log('================================\n');
  
  // Сохраняем маппинг
  const mappingPath = path.join(__dirname, 'id-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(idMapping, null, 2));
  console.log('📁 Маппинг ID сохранён:', mappingPath);
}

migrate().catch(err => {
  console.error('❌ Ошибка миграции:', err);
  process.exit(1);
});
