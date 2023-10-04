const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

// ====== Functions ======= \\
function loadImage(e) {
    const file = e.target.files[0];

    if(!isFileImageFormat(file)) {
        alertError("Not a valid image format")
        return
    }

    //Get original dimensions
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = function () {
        widthInput.value = this.width;
        heightInput.value = this.height;
    }

    form.style.display = 'block';
    filename.innerText = file.name;
    outputPath.innerText = path.join(os.homedir(), 'image-resizer');
}

function alertError(message) {
    Toastify.toast({
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: 'red',
            color: 'WhiteSmoke',
            textAlign: 'center'
        }
    })
}

function alertSuccess(message) {
    Toastify.toast({
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: 'green',
            color: 'WhiteSmoke',
            textAlign: 'center'
        }
    })
}

function isFileImageFormat(file) {
    const acceptedFileTypes = ['image/gif', "image/png", "image/jpeg", "image/jpg"]
    return file && acceptedFileTypes.includes(file['type'])
}

function sendImage(e) {
    e.preventDefault();
    const width = widthInput.value;
    const height = heightInput.value;
    const imgPath = img.files[0].path;

    if (!img.files) {
        alertError("Please upload an image");
    }
    if (width === "" || height === "") {
        alertError("Please fill in a height and width");
    }

    //Send to main using ipcRenderer
    ipcRenderer.send('image:resize', {
        imgPath,
        width,
        height,
    });
}

// Catch the image:done event
ipcRenderer.on('image:done', () =>{
    alertSuccess(`Image resized to ${widthInput.value} x ${heightInput.value}`)
})

//Event Listeners
img.addEventListener('change', loadImage)
form.addEventListener('submit', sendImage)
