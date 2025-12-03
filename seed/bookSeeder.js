const db = require("../config/db")

const books = [
    { judul: "Laskar Pelangi", penulis: "Andrea Hirata", penerbit: "Bentang Pustaka", deskripsi: "Kisah inspiratif tentang pendidikan.", tahun_terbit: 2005, id_kategori: 1, jumlah_total: 10, jumlah_tersedia: 10 },
    { judul: "Sang Pemimpi", penulis: "Andrea Hirata", penerbit: "Bentang Pustaka", deskripsi: "Lanjutan kisah Laskar Pelangi.", tahun_terbit: 2006, id_kategori: 1, jumlah_total: 8, jumlah_tersedia: 8 },
    { judul: "Negeri 5 Menara", penulis: "Ahmad Fuadi", penerbit: "Gramedia", deskripsi: "Kisah persahabatan di pesantren modern.", tahun_terbit: 2009, id_kategori: 1, jumlah_total: 9, jumlah_tersedia: 9 },
    { judul: "Perahu Kertas", penulis: "Dewi Lestari", penerbit: "Bentang Pustaka", deskripsi: "Novel romansa modern.", tahun_terbit: 2008, id_kategori: 1, jumlah_total: 7, jumlah_tersedia: 7 },
    { judul: "Hujan", penulis: "Tere Liye", penerbit: "Republika", deskripsi: "Novel fiksi futuristik bertema bencana.", tahun_terbit: 2016, id_kategori: 1, jumlah_total: 10, jumlah_tersedia: 10 },

    { judul: "Sapiens", penulis: "Yuval Noah Harari", penerbit: "Harper", deskripsi: "Sejarah singkat umat manusia.", tahun_terbit: 2011, id_kategori: 2, jumlah_total: 7, jumlah_tersedia: 7 },
    { judul: "Homo Deus", penulis: "Yuval Noah Harari", penerbit: "Harper", deskripsi: "Masa depan evolusi manusia.", tahun_terbit: 2015, id_kategori: 2, jumlah_total: 6, jumlah_tersedia: 6 },
    { judul: "21 Lessons for the 21st Century", penulis: "Yuval Noah Harari", penerbit: "Spiegel & Grau", deskripsi: "Tantangan global abad 21.", tahun_terbit: 2018, id_kategori: 2, jumlah_total: 8, jumlah_tersedia: 8 },
    { judul: "Filsafat Umum", penulis: "A. Susanto", penerbit: "RajaGrafindo", deskripsi: "Pengantar filsafat menyeluruh.", tahun_terbit: 2020, id_kategori: 2, jumlah_total: 5, jumlah_tersedia: 5 },
    { judul: "Sejarah Dunia yang Disembunyikan", penulis: "Jonathan Black", penerbit: "PT Mizan", deskripsi: "Teori sejarah perspektif berbeda.", tahun_terbit: 2011, id_kategori: 2, jumlah_total: 6, jumlah_tersedia: 6 },

    { judul: "Belajar Pemrograman JavaScript", penulis: "Sofyan Hadi", penerbit: "Informatika", deskripsi: "Belajar JS dari dasar.", tahun_terbit: 2022, id_kategori: 3, jumlah_total: 10, jumlah_tersedia: 10 },
    { judul: "Node.js Developer Guide", penulis: "Muhammad Rizal", penerbit: "TeknoPress", deskripsi: "Panduan membangun backend Node.js.", tahun_terbit: 2023, id_kategori: 3, jumlah_total: 7, jumlah_tersedia: 7 },
    { judul: "React untuk Pemula", penulis: "Arka Yuda", penerbit: "Informatika", deskripsi: "Dasar React dan SPA.", tahun_terbit: 2023, id_kategori: 3, jumlah_total: 9, jumlah_tersedia: 9 },
    { judul: "Full-Stack Web Programming", penulis: "Dedi Kurniawan", penerbit: "ExpertCode", deskripsi: "Panduan membangun aplikasi web fullstack.", tahun_terbit: 2021, id_kategori: 3, jumlah_total: 6, jumlah_tersedia: 6 },
    { judul: "MongoDB Masterclass", penulis: "Rama Wirawan", penerbit: "TeknoPress", deskripsi: "Fondasi database NoSQL modern.", tahun_terbit: 2022, id_kategori: 3, jumlah_total: 7, jumlah_tersedia: 7 },

    { judul: "Fisika Dasar untuk Sains", penulis: "Halliday & Resnick", penerbit: "Wiley", deskripsi: "Klasik fisika dasar.", tahun_terbit: 2014, id_kategori: 4, jumlah_total: 10, jumlah_tersedia: 10 },
    { judul: "Kalkulus Modern", penulis: "Purcell", penerbit: "Pearson", deskripsi: "Konsep dasar kalkulus.", tahun_terbit: 2013, id_kategori: 4, jumlah_total: 7, jumlah_tersedia: 7 },
    { judul: "Kimia Organik", penulis: "Solomons", penerbit: "Wiley", deskripsi: "Reaksi dan struktur organik.", tahun_terbit: 2012, id_kategori: 4, jumlah_total: 6, jumlah_tersedia: 6 },
    { judul: "Biologi Molekuler", penulis: "Bruce Alberts", penerbit: "Garland Science", deskripsi: "Mekanisme biologi sel.", tahun_terbit: 2017, id_kategori: 4, jumlah_total: 9, jumlah_tersedia: 9 },
    { judul: "Astronomi dan Alam Semesta", penulis: "Neil Tyson", penerbit: "Cosmos Publishing", deskripsi: "Teori dan eksplorasi luar angkasa.", tahun_terbit: 2019, id_kategori: 4, jumlah_total: 5, jumlah_tersedia: 5 },

    { judul: "Sejarah Indonesia Modern", penulis: "M.C. Ricklefs", penerbit: "KITLV", deskripsi: "Perjalanan sejarah Indonesia.", tahun_terbit: 2015, id_kategori: 5, jumlah_total: 6, jumlah_tersedia: 6 },
    { judul: "Perang Dunia II", penulis: "Anthony Beevor", penerbit: "Penguin Books", deskripsi: "Narasi perang terbesar dunia.", tahun_terbit: 2012, id_kategori: 5, jumlah_total: 7, jumlah_tersedia: 7 },
    { judul: "Kemerdekaan Indonesia", penulis: "Soe Hok Gie", penerbit: "Kompas", deskripsi: "Perjuangan menuju kemerdekaan.", tahun_terbit: 2000, id_kategori: 5, jumlah_total: 9, jumlah_tersedia: 9 },
    { judul: "Jatuh Bangun Kerajaan Romawi", penulis: "Peter Heather", penerbit: "Oxford", deskripsi: "Kisah kekaisaran Romawi.", tahun_terbit: 2011, id_kategori: 5, jumlah_total: 8, jumlah_tersedia: 8 },
    { judul: "Peradaban Islam", penulis: "Harun Nasution", penerbit: "UI Press", deskripsi: "Sejarah perkembangan peradaban Islam.", tahun_terbit: 2005, id_kategori: 5, jumlah_total: 10, jumlah_tersedia: 10 },

    { judul: "Manajemen Keuangan Modern", penulis: "Kasmir", penerbit: "RajaGrafindo", deskripsi: "Teori keuangan dan bisnis modern.", tahun_terbit: 2020, id_kategori: 6, jumlah_total: 10, jumlah_tersedia: 10 },
    { judul: "Ekonomi Mikro", penulis: "N. Gregory Mankiw", penerbit: "McGraw-Hill", deskripsi: "Analisis pasar dan perilaku ekonomi.", tahun_terbit: 2015, id_kategori: 6, jumlah_total: 6, jumlah_tersedia: 6 },
    { judul: "Ekonomi Makro", penulis: "N. Gregory Mankiw", penerbit: "McGraw-Hill", deskripsi: "Konsep ekonomi makro global.", tahun_terbit: 2014, id_kategori: 6, jumlah_total: 5, jumlah_tersedia: 5 },
    { judul: "Marketing 5.0", penulis: "Philip Kotler", penerbit: "Wiley", deskripsi: "Strategi pemasaran berbasis teknologi.", tahun_terbit: 2021, id_kategori: 6, jumlah_total: 7, jumlah_tersedia: 7 },
    { judul: "Bisnis Digital", penulis: "Rhenald Kasali", penerbit: "Mizan", deskripsi: "Inovasi bisnis era digital.", tahun_terbit: 2019, id_kategori: 6, jumlah_total: 10, jumlah_tersedia: 10 },

    { judul: "Pendidikan Karakter", penulis: "Zubaedi", penerbit: "RajaGrafindo", deskripsi: "Konsep karakter dalam pendidikan.", tahun_terbit: 2017, id_kategori: 7, jumlah_total: 7, jumlah_tersedia: 7 },
    { judul: "Psikologi Belajar", penulis: "Slameto", penerbit: "Rineka Cipta", deskripsi: "Teori dan pendekatan belajar.", tahun_terbit: 2010, id_kategori: 7, jumlah_total: 8, jumlah_tersedia: 8 },
    { judul: "Metode Penelitian Pendidikan", penulis: "Sugiyono", penerbit: "Alfabeta", deskripsi: "Pendekatan penelitian kuantitatif dan kualitatif.", tahun_terbit: 2019, id_kategori: 7, jumlah_total: 10, jumlah_tersedia: 10 },
    { judul: "Teori Kurikulum", penulis: "Oemar Hamalik", penerbit: "Rineka Cipta", deskripsi: "Pengembangan kurikulum pendidikan.", tahun_terbit: 2012, id_kategori: 7, jumlah_total: 5, jumlah_tersedia: 5 },
    { judul: "Evaluasi Pembelajaran", penulis: "Nana Sudjana", penerbit: "PT Remaja Rosdakarya", deskripsi: "Teknik evaluasi hasil belajar.", tahun_terbit: 2017, id_kategori: 7, jumlah_total: 6, jumlah_tersedia: 6 },

    { judul: "Seni Musik Nusantara", penulis: "Bambang Prasetyo", penerbit: "Budaya Indonesia", deskripsi: "Eksplorasi musik tradisional.", tahun_terbit: 2021, id_kategori: 8, jumlah_total: 4, jumlah_tersedia: 4 },
    { judul: "Teknik Melukis Realis", penulis: "Tono Suprapto", penerbit: "ArtHouse", deskripsi: "Teknik melukis tingkat profesional.", tahun_terbit: 2018, id_kategori: 8, jumlah_total: 5, jumlah_tersedia: 5 },
    { judul: "Fotografi Digital Modern", penulis: "Alex Fernando", penerbit: "LensArt", deskripsi: "Seni dan teknik fotografi.", tahun_terbit: 2019, id_kategori: 8, jumlah_total: 7, jumlah_tersedia: 7 },
    { judul: "Panduan Desain Grafis", penulis: "Rino Wijaya", penerbit: "DesignLab", deskripsi: "Teknik dan prinsip desain grafis.", tahun_terbit: 2020, id_kategori: 8, jumlah_total: 8, jumlah_tersedia: 8 },
    { judul: "Seni Drama dan Teater", penulis: "Siti Nurani", penerbit: "Budaya Nusantara", deskripsi: "Sejarah dan teknik drama panggung.", tahun_terbit: 2018, id_kategori: 8, jumlah_total: 10, jumlah_tersedia: 10 },

    { judul: "Ilmu Politik Kontemporer", penulis: "Miriam Budiardjo", penerbit: "Gramedia", deskripsi: "Pendekatan ilmu politik modern.", tahun_terbit: 2008, id_kategori: 9, jumlah_total: 6, jumlah_tersedia: 6 },
    { judul: "Hubungan Internasional Global", penulis: "Henry Kissinger", penerbit: "Penguin", deskripsi: "Hubungan geopolitik internasional.", tahun_terbit: 2014, id_kategori: 9, jumlah_total: 5, jumlah_tersedia: 5 },
    { judul: "Demokrasi dan Kebebasan", penulis: "Amartya Sen", penerbit: "Oxford", deskripsi: "Konsep demokrasi dan hak masyarakat.", tahun_terbit: 2011, id_kategori: 9, jumlah_total: 7, jumlah_tersedia: 7 },
    { judul: "Kebijakan Publik", penulis: "Dunn", penerbit: "Routledge", deskripsi: "Analisis kebijakan sosial dan publik.", tahun_terbit: 2014, id_kategori: 9, jumlah_total: 9, jumlah_tersedia: 9 },
    { judul: "Pemikiran Politik Islam", penulis: "Fazlur Rahman", penerbit: "UI Press", deskripsi: "Pemikiran politik dalam dunia Islam.", tahun_terbit: 2002, id_kategori: 9, jumlah_total: 8, jumlah_tersedia: 8 },

    { judul: "Kesehatan Masyarakat", penulis: "Slamet Riyadi", penerbit: "Kesehatan Nasional", deskripsi: "Dasar-dasar kesehatan masyarakat.", tahun_terbit: 2018, id_kategori: 10, jumlah_total: 7, jumlah_tersedia: 7 },
    { judul: "Gizi dan Nutrisi", penulis: "Lisna Ayu", penerbit: "Nutrisi Mandiri", deskripsi: "Pola nutrisi sehat.", tahun_terbit: 2016, id_kategori: 10, jumlah_total: 6, jumlah_tersedia: 6 },
    { judul: "Pertolongan Pertama Medis", penulis: "Henry Joseph", penerbit: "Medika", deskripsi: "Panduan pertolongan pertama.", tahun_terbit: 2014, id_kategori: 10, jumlah_total: 9, jumlah_tersedia: 9 },
    { judul: "Farmakologi Dasar", penulis: "Rini Kusumawati", penerbit: "Medika", deskripsi: "Farmasi dan mekanisme obat.", tahun_terbit: 2017, id_kategori: 10, jumlah_total: 8, jumlah_tersedia: 8 },
    { judul: "Anatomi Tubuh Manusia", penulis: "Stephen Rogers", penerbit: "Medical Press", deskripsi: "Struktur anatomi tubuh manusia.", tahun_terbit: 2019, id_kategori: 10, jumlah_total: 10, jumlah_tersedia: 10 }
];



async function runSeeder() {
    try {
        for (const book of books) {
            await db.query(
                `INSERT INTO buku 
        (judul, penulis, penerbit, deskripsi, tahun_terbit, id_kategori, jumlah_total, jumlah_tersedia)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    book.judul,
                    book.penulis,
                    book.penerbit,
                    book.deskripsi,
                    book.tahun_terbit,
                    book.id_kategori,
                    book.jumlah_total,
                    book.jumlah_tersedia
                ]
            );
        }

        console.log("Seeder berhasil — 50 buku telah dimasukkan");
        process.exit();
    } catch (err) {
        console.error("Seeder gagal:", err);
        process.exit();
    }
}

runSeeder();
