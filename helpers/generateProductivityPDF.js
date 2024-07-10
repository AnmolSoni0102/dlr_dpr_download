const { PDFDocument } = require("pdf-lib");
const { createCanvas, loadImage } = require("canvas");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const fs = require("fs");
const path = require("path");

async function createPdfWithBarChart(formatData, filterBy, bookingID) {
  // Set up the chart rendering context
  const width = 595;
  const height = 842;
  const chartWidth = width / 2;
  const chartHeight = height / 2.5;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width: chartWidth,
    height: chartHeight,
    pixelRatio: 5
  });

  console.log(`formatData `, formatData);
  const { data, total = {} } = formatData;
  const weeks = data.map((_, i) =>
    filterBy == "daily" ? "daily" : `week_${i + 1}`
  );
  const dlrData = data.map((item, i) => {
    return item?.dlr?.dlr ?? 0;
  });

  console.log(data, weeks, dlrData);
  // Set up the bar chart data
  const chartData = {
    type: "bar",
    data: {
      labels: weeks,
      datasets: [
        {
          label: "Dlr Data",
          data: dlrData,
          backgroundColor: "blue",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          barThickness: 25,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 500, // Set the step size to 500
          },
        },
      },
    },
  };

  // Render the chart to a buffer
  const chartBuffer = await chartJSNodeCanvas.renderToBuffer(chartData);

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Add a blank page to the PDF
  const page = pdfDoc.addPage([width, height]);

  // Load the logo image
  const logoPath = path.join(__dirname, "logo.png");
  const logoBytes = fs.readFileSync(logoPath);
  const logoImage = await pdfDoc.embedPng(logoBytes);

  // Get the dimensions of the logo image
  const logoDims = logoImage.scale(0.15); // Adjust the scale as needed
  page.drawImage(logoImage, {
    x: 10,
    y: page.getHeight() - logoDims.height - 10, // Adjust the y-coordinate as needed
    width: logoDims.width,
    height: logoDims.height,
  });

  // Draw the booking ID and Daily Data text below the logo
  const topText = 10;
  const topTextY = page.getHeight() - logoDims.height - 30; // Adjust the Y position as needed

  page.drawText(`BookingID: ${bookingID}`, {
    x: topText,
    y: topTextY,
    size: 12,
  });

  page.drawText(filterBy == "daily" ? `Daily Data` : "Weekly Data", {
    x: topText,
    y: topTextY - 15,
    size: 12,
  });

  // Embed the chart image in the PDF
  const chartImage = await pdfDoc.embedPng(chartBuffer);
  // Calculate the center position for the chart
  const chartX = (page.getWidth() - chartWidth) / 2;
  const chartY = topTextY - 40 - chartHeight; 

  // Draw the chart image on the PDF page
  page.drawImage(chartImage, {
    x: chartX,
    y: chartY,
    width: chartWidth,
    height: chartHeight,
  });

  const {
    totalDlr = {},
    totalDpr = {},
    averageDlr = {},
    averageDpr = {},
  } = total;
  // Define the additional data
  const prodData = {
    totalDlr: totalDlr.dlr ?? 0,
    //totalDpr: totalDpr.actual_outcome??0,
    averageDlr: averageDlr.dlr ?? 0,
    //averageDpr: averageDpr.actual_outcome??0
  };

  // Add the data below the chart
  const textX = 10;
  const textY = chartY - 60; // Adjust the Y position as needed

  page.drawText(`Total Dlr: ${prodData.totalDlr}`, {
    x: textX,
    y: textY,
    size: 12,
  });

  //   page.drawText(`Total Dpr: ${prodData.totalDpr}`, {
  //     x: textX,
  //     y: textY - 15,
  //     size: 12
  //   });

  page.drawText(`Average Dlr: ${prodData.averageDlr}`, {
    x: textX,
    y: textY - 30,
    size: 12,
  });

  //   page.drawText(`Average Dpr: ${prodData.averageDpr}`, {
  //     x: textX,
  //     y: textY - 45,
  //     size: 12
  //   });

  // Save the PDF to a file
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync("bar-chart.pdf", pdfBytes);
}

module.exports = createPdfWithBarChart;
