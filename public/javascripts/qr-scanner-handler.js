function onScanSuccess(decodedText, decodedResult) {
  const classId = document.getElementById("classId").value;
  // Handle on success condition with the decoded text or result.
  const sinhvienId = decodedText.replace("L2BRARY_", "");
  axios.get(`/users/${sinhvienId}`).then((sinhvien) => {
    console.log(sinhvien);
    const res = confirm("Xin chao " + sinhvien.data.fullName);
    if (res) {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "/attendance";

      const svidInput = document.createElement("input");
      svidInput.name = "sinhvienIds";
      svidInput.value = JSON.stringify([sinhvienId]);
      form.appendChild(svidInput);

      const submitTimeInput = document.createElement("input");
      submitTimeInput.type = "hidden";
      submitTimeInput.name = "submitTime";
      submitTimeInput.value = new Date();
      form.appendChild(submitTimeInput);

      const classIdInput = document.createElement("input");
      classIdInput.type = "hidden";
      classIdInput.name = "classId";
      classIdInput.value = classId;
      form.appendChild(classIdInput);

      console.log(form);
      form.submit();
    }
  });
}

const html5QrcodeScanner = new Html5QrcodeScanner("reader", {
  fps: 10,
  qrbox: 250,
});
html5QrcodeScanner.render(onScanSuccess);
