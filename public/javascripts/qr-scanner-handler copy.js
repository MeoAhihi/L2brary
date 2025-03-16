function onScanSuccess(decodedText, decodedResult) {
  const sessionId = window.location.pathname.replace("/session/", "");

  if (!decodedText.startsWith("L2BRARY_")) {
    console.error("Invalid QR code");
    return;
  }
  // Handle on success condition with the decoded text or result.
  const sinhvienId = decodedText.replace("L2BRARY_", "");
  document.location.href = `/attendance/confirm?sessionId=${sessionId}&sinhvienId=${sinhvienId}`;
}

const html5QrcodeScanner = new Html5QrcodeScanner("reader", {
  fps: 10,
  qrbox: 250,
});
html5QrcodeScanner.render(onScanSuccess);
