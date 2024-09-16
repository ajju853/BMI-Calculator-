
let progressChart, bmiTrendsChart;
let scene, camera, renderer, bmiIcons = [];

document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    setupEventListeners();
    init3DBackground();
    animate();
});

function initCharts() {
    const progressCtx = document.getElementById('progressChart').getContext('2d');
    progressChart = new Chart(progressCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Weight Progress',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: false } }
        }
    });

    const bmiCtx = document.getElementById('bmiTrendsChart').getContext('2d');
    bmiTrendsChart = new Chart(bmiCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'BMI Trend',
                data: [],
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: false } }
        }
    });
}

function setupEventListeners() {
    document.getElementById('calculateBtn').addEventListener('click', calculateMetrics);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
}

function calculateMetrics() {
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const activityLevel = document.getElementById('activityLevel').value;
    const waist = parseFloat(document.getElementById('waist').value);

    const bmi = calculateBMI(weight, height);
    const bodyFat = estimateBodyFat(bmi, age, gender);
    const bmr = calculateBMR(weight, height, age, gender);
    const calorieNeeds = calculateCalorieNeeds(bmr, activityLevel);
    const waistHeightRatio = calculateWaistHeightRatio(waist, height);

    updateResults(bmi, bodyFat, bmr, calorieNeeds, waistHeightRatio);
    updateCharts(weight, bmi);
    provideHealthAdvice(bmi, waistHeightRatio);
}

function calculateBMI(weight, height) {
    return weight / ((height / 100) ** 2);
}

function estimateBodyFat(bmi, age, gender) {
    return gender === 'male' ? (1.20 * bmi) + (0.23 * age) - 16.2 : (1.20 * bmi) + (0.23 * age) - 5.4;
}

function calculateBMR(weight, height, age, gender) {
    return gender === 'male' ? 
        (10 * weight) + (6.25 * height) - (5 * age) + 5 :
        (10 * weight) + (6.25 * height) - (5 * age) - 161;
}

function calculateCalorieNeeds(bmr, activityLevel) {
    const activityFactors = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        very: 1.725,
        extra: 1.9
    };
    return bmr * activityFactors[activityLevel];
}

function calculateWaistHeightRatio(waist, height) {
    return waist / height;
}

function updateResults(bmi, bodyFat, bmr, calorieNeeds, waistHeightRatio) {
    document.getElementById('bmiResult').textContent = `BMI: ${bmi.toFixed(2)}`;
    document.getElementById('bodyFatResult').textContent = `Estimated Body Fat: ${bodyFat.toFixed(2)}%`;
    document.getElementById('bmrResult').textContent = `BMR: ${bmr.toFixed(0)} calories/day`;
    document.getElementById('calorieNeedsResult').textContent = `Daily Calorie Needs: ${calorieNeeds.toFixed(0)} calories`;
    document.getElementById('waistHeightRatio').textContent = `Waist-to-Height Ratio: ${waistHeightRatio.toFixed(2)}`;
}

function updateCharts(weight, bmi) {
    const date = new Date().toLocaleDateString();
    progressChart.data.labels.push(date);
    progressChart.data.datasets[0].data.push(weight);
    progressChart.update();

    bmiTrendsChart.data.labels.push(date);
    bmiTrendsChart.data.datasets[0].data.push(bmi);
    bmiTrendsChart.update();
}

function provideHealthAdvice(bmi, waistHeightRatio) {
    let advice = "Based on your metrics:\n";
    if (bmi < 18.5) advice += "You're underweight. Consider increasing your calorie intake.\n";
    else if (bmi < 25) advice += "Your BMI is in the healthy range.\n";
    else if (bmi < 30) advice += "You're overweight. Consider increasing physical activity.\n";
    else advice += "You're in the obese range. Consult a healthcare professional.\n";

    if (waistHeightRatio > 0.5) advice += "Your waist-to-height ratio indicates increased health risks.\n";

    document.getElementById('healthAdvice').textContent = advice;
    document.getElementById('healthRisks').textContent = `Health Risk Level: ${getHealthRiskLevel(bmi, waistHeightRatio)}`;
}

function getHealthRiskLevel(bmi, waistHeightRatio) {
    if (bmi < 18.5 || bmi >= 30 || waistHeightRatio > 0.6) return "High";
    if (bmi >= 25 || waistHeightRatio > 0.5) return "Moderate";
    return "Low";
}

function init3DBackground() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('bg-canvas').appendChild(renderer.domElement);

    const bmiIconGeometry = new THREE.IcosahedronGeometry(0.5, 0);
    const bmiIconMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });

    for (let i = 0; i < 50; i++) {
        const bmiIcon = new THREE.Mesh(bmiIconGeometry, bmiIconMaterial);
        bmiIcon.position.set(
            Math.random() * 40 - 20,
            Math.random() * 40 - 20,
            Math.random() * 40 - 20
        );
        bmiIcons.push(bmiIcon);
        scene.add(bmiIcon);
    }

    camera.position.z = 5;
}

function animate() {
    requestAnimationFrame(animate);

    bmiIcons.forEach(icon => {
        icon.rotation.x += 0.01;
        icon.rotation.y += 0.01;
    });

    renderer.render(scene, camera);
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});