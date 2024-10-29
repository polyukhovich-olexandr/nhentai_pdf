const { API } = require('nhentai-api');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const api = new API();

async function main() {
    const fetch = (await import('node-fetch')).default; // Динамічний імпорт
    const book = await api.getRandomBook();
    const outputPath = `hentai_${book.id}.pdf`;
    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream(outputPath));
    for (const page of book.pages) {
        const imageUrl = api.getImageURL(page);
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            console.error(`Failed to fetch image at ${imageUrl}`);
            continue; // Пропустіть цю сторінку, якщо зображення не завантажується
        }
        const imageBuffer = await imageResponse.arrayBuffer();
        doc.image(imageBuffer, { fit: [500, 700], align: 'center', valign: 'center' });
        doc.addPage();
    }

    // Завершуємо PDF документ
    doc.end();
    console.log(`PDF файл збережено як ${outputPath}`);
}

main().catch(error => {
    console.error('Error fetching the book:', error);
});
