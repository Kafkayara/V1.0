const form = document.getElementById('form-pengeluaran');
const inputNama = document.getElementById('input-nama');
const inputNominal = document.getElementById('input-nominal');
const inputTanggal = document.getElementById('input-tanggal');
const daftarPengeluaran = document.getElementById('daftar-pengeluaran');

let dataPengeluaran = [];

function renderDaftar() {
    daftarPengeluaran.innerHTML = '';

    dataPengeluaran.forEach(function (item) {
        const li = document.createElement('li');
        li.textContent = `${item.nama} - Rp ${item.nominal} (${item.tanggal})`;
        daftarPengeluaran.appendChild(li);
    });
}

form.addEventListener('submit', function (event) {
    event.preventDefault();

    const pengeluaranBaru = {
        nama: inputNama.value,
        nominal: Number(inputNominal.value),
        tanggal: inputTanggal.value
    };

    dataPengeluaran.push(pengeluaranBaru);

    renderDaftar();

    form.reset();

    console.log('Isi array sekarang:', dataPengeluaran);
});