function onScanSuccess(decodedText, decodedResult) {
  const classId = document.getElementById("classId").value;

  if (!decodedText.startsWith("L2BRARY_")) {
    console.error("Invalid QR code");
    return;
  }
  // Handle on success condition with the decoded text or result.
  const sinhvienId = decodedText.replace("L2BRARY_", "");
  document.location.href = `/attendance/confirm?classId=${classId}&sinhvienId=${sinhvienId}`;
}

const html5QrcodeScanner = new Html5QrcodeScanner("reader", {
  fps: 10,
  qrbox: 250,
});
html5QrcodeScanner.render(onScanSuccess);
