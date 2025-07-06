// Drag & drop + file input logic
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const preview = document.getElementById('preview');
const convertBtn = document.getElementById('convert-btn');
let images = [];

uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', e => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});
uploadArea.addEventListener('dragleave', e => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
});
uploadArea.addEventListener('drop', e => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});
fileInput.addEventListener('change', e => handleFiles(e.target.files));

function handleFiles(files) {
  images = [];
  preview.innerHTML = '';
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      images.push(file);
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.onload = () => URL.revokeObjectURL(img.src);
      preview.appendChild(img);
    }
  }
  convertBtn.disabled = images.length === 0;
}

convertBtn.addEventListener('click', async () => {
  if (images.length === 0) return;
  convertBtn.disabled = true;
  convertBtn.textContent = 'Memproses...';
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  for (let i = 0; i < images.length; i++) {
    const imgFile = images[i];
    const imgData = await fileToDataURL(imgFile);
    const img = new Image();
    img.src = imgData;
    await new Promise(res => img.onload = res);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    // Resize image to fit page
    let ratio = Math.min(pageWidth / img.width, pageHeight / img.height);
    let imgW = img.width * ratio;
    let imgH = img.height * ratio;
    let x = (pageWidth - imgW) / 2;
    let y = (pageHeight - imgH) / 2;
    if (i > 0) pdf.addPage();
    pdf.addImage(img, 'JPEG', x, y, imgW, imgH);
  }
  pdf.save('images.pdf');
  convertBtn.textContent = 'Konversi ke PDF';
  convertBtn.disabled = false;
});

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
} 