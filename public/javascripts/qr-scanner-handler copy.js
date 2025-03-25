function onScanSuccess(decodedText, decodedResult) {
  const data = window.location.pathname.split("/");

  if (!decodedText.startsWith("L2BRARY_")) {
    console.error("Invalid QR code");
    return;
  }
  // Handle on success condition with the decoded text or result.
  const classGroupId = data[1];
  const sessionId = data[3];
  const sinhvienId = decodedText.replace("L2BRARY_", "");

  document.location.href = `/${classGroupId}/attendance/confirm?sessionId=${sessionId}&sinhvienId=${sinhvienId}`;
  setTimeout(() => {}, 1000);
}

const html5QrcodeScanner = new Html5QrcodeScanner("reader", {
  fps: 10,
  qrbox: 250,
});
html5QrcodeScanner.render(onScanSuccess);
