const d = require('../web-blog-726ee-export.json');

console.log('Проверка поля icon в постах Firebase:\n');

Object.entries(d.posts).forEach(([id, post]) => {
  if (post.icon) {
    console.log(`${post.title.substring(0,30)}... → icon: ${post.icon.length} символов`);
  } else {
    console.log(`${post.title.substring(0,30)}... → нет icon`);
  }
});

