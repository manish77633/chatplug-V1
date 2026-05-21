const { queryEmbeddings } = require('./services/embeddingService');
async function test() {
  try {
    const res = await queryEmbeddings({ query: 'hello', topK: 1 });
    console.log('Result:', res);
  } catch(e) {
     console.error('Error:', e.message);
  }
}
test();
