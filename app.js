document.getElementById('hideButton').addEventListener('click', hideMessage);
document.getElementById('revealButton').addEventListener('click', revealMessage);
document.getElementById('imageInput').addEventListener('change', handleImage);

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let img = new Image();

// Penanda akhir pesan
const endOfMessageMarker = "11111111"; // 8-bit yang mewakili karakter '\u00FF'

function handleImage(e) {
    let reader = new FileReader();
    reader.onload = function(event) {
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            // Tampilkan gambar asli
            document.getElementById('originalImage').src = canvas.toDataURL();
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
}

function hideMessage() {
    let message = document.getElementById('messageInput').value;
    if (!message) {
        alert('Masukkan pesan yang ingin disembunyikan');
        return;
    }
    
    // Convert message to binary and add end of message marker
    let binaryMessage = '';
    for (let i = 0; i < message.length; i++) {
        let binaryChar = message.charCodeAt(i).toString(2).padStart(8, '0');
        binaryMessage += binaryChar;
    }
    binaryMessage += endOfMessageMarker; // Add end of message marker
    
    // Get image data
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
    
    // Hide message using PVD
    for (let i = 0, msgIndex = 0; i < data.length && msgIndex < binaryMessage.length; i += 4) {
        let pixelValue = data[i]; // Use the red channel for simplicity
        let diff = pixelValue % 2; // Get LSB
        let bit = binaryMessage[msgIndex] === '1' ? 1 : 0;
        
        if (diff !== bit) {
            data[i] += bit - diff;
        }
        
        msgIndex++;
    }
    
    ctx.putImageData(imageData, 0, 0);
    // Tampilkan gambar dengan pesan
    document.getElementById('stegoImage').src = canvas.toDataURL();
    alert('Pesan berhasil disembunyikan!');
}

function revealMessage() {
    // Get image data
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
    
    let binaryMessage = '';
    
    // Extract message using PVD
    for (let i = 0; i < data.length; i += 4) {
        let pixelValue = data[i]; // Use the red channel for simplicity
        let bit = pixelValue % 2;
        binaryMessage += bit.toString();
    }
    
    // Find end of message marker
    let endIndex = binaryMessage.indexOf(endOfMessageMarker);
    if (endIndex === -1) {
        alert('Pesan tidak ditemukan');
        return;
    }
    binaryMessage = binaryMessage.slice(0, endIndex); // Trim message at end of message marker
    
    // Convert binary to text
    let message = '';
    for (let i = 0; i < binaryMessage.length; i += 8) {
        let byte = binaryMessage.slice(i, i + 8);
        let charCode = parseInt(byte, 2);
        message += String.fromCharCode(charCode);
    }
    
    document.getElementById('outputMessage').textContent = message;
}
