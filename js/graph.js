async function fetchCSVData() {
    const response = await fetch('data/sampled-sim.csv');
    const csvText = await response.text();

    const rows = csvText.split('\n').slice(1);

    const metData = [];
    const rsqData = [];

    rows.forEach(row => {
        const [eventNumber, ht, met, mr, rsq, darkPhotonProduced] = row.split(',');

        const metValue = parseFloat(met);
        const rsqValue = parseFloat(rsq);

        if (metValue > 0 && rsqValue > 0) {
            metData.push(metValue);
            rsqData.push(rsqValue);
        }
    });

    return { metData, rsqData };
}

function calculateLinearRegression(xData, yData) {
    const n = xData.length;  // Number of data points

    // Calculate the sums needed for the formulas
    const sumX = xData.reduce((acc, val) => acc + val, 0); // Sum of x values
    const sumY = yData.reduce((acc, val) => acc + val, 0); // Sum of y values
    const sumXY = xData.reduce((acc, val, i) => acc + val * yData[i], 0); // Sum of (x * y) values
    const sumX2 = xData.reduce((acc, val) => acc + val * val, 0); // Sum of (x^2) values

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
}


async function renderChart() {
    const { metData, rsqData } = await fetchCSVData();

    const ctx = document.getElementById('metVsRsqChart').getContext('2d');

    const { slope, intercept } = calculateLinearRegression(metData, rsqData);

    const regressionData = metData.map(x => ({
        x,
        y: slope * x + intercept
    }));

    // Create the chart
    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'MET vs Rsq',
                    data: metData.map((met, index) => ({
                        x: met,
                        y: rsqData[index]
                    })),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Linear Regression Line',
                    data: regressionData,
                    type: 'line',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'MET (Missing Transverse Energy)'
                    },
                    beginAtZero: true
                },
                y: {
                    title: {
                        display: true,
                        text: 'Rsq'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', renderChart);