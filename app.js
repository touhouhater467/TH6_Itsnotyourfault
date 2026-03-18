// --- 1. THREE.JS SCENE SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshNormalMaterial(); // Colors based on face direction
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
camera.position.z = 5;

// --- 2. MEDIAPIPE HAND TRACKING SETUP ---
const videoElement = document.getElementById('webcam');

function onResults(results) {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const hand = results.multiHandLandmarks[0];
        
        // Landmark 9 is the middle of the hand (Middle finger MCP)
        // MediaPipe coordinates are 0 to 1, we map them to radians
        const x = hand[9].x - 0.5; 
        const y = hand[9].y - 0.5;

        // Rotate cube based on hand position
        cube.rotation.y = x * 10;
        cube.rotation.x = y * 10;
    }
    renderer.render(scene, camera);
}

const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
hands.onResults(onResults);

// --- 3. START WEBCAM ---
const cameraFeed = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 640,
    height: 480
});
cameraFeed.start();