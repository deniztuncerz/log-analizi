# 🚀 Log Analizörü Kurulum Rehberi

Log Analizörü masaüstü uygulaması, başka hiçbir dış bağımlılığa (Node.js, Electron, tarayıcı vb.) ihtiyaç duymadan çalışacak şekilde paketlenmiştir. İhtiyacı olan her bileşen, yükleyici (Installer) içerisine entegre edilmiştir. Uygulamayı başka bir bilgisayarda kullanabilmek için aşağıdaki adımları izlemeniz yeterlidir.

## 📂 1. Yükleyici Dosyasını Bulma

Build işlemi tamamlandıktan sonra, proje klasörünüzün içinde yeni bir klasör oluşur:
**`Masaustu_Kurulum_Dosyalari`**

Bu klasörün içerisine girdiğinizde `Log Analizoru Setup 4.2.0.exe` (veya benzeri bir setup isimli `.exe` dosyası) göreceksiniz. Kurulum yapacağınız diğer bilgisayara sadece **bu `.exe` dosyasını** kopyalamanız (Flash bellek, e-posta, Google Drive vb. aracılığıyla) yeterlidir. Başka bir dosya taşımanıza gerek yoktur.

## ⚙️ 2. Başka Bir Bilgisayara Kurulum Yapma

1. Taşıdığınız `Log Analizoru Setup ... .exe` isimli kurulum dosyasını hedef bilgisayarda çift tıklayarak çalıştırın.
2. Kurulum sihirbazı otomatik olarak başlayacaktır. Kurulum yönergelerini takip ederek uygulamayı bilgisayara yükleyin.
3. Kurulum bittikten sonra masaüstüne ve Başlat menüsüne **Log Analizoru** kısayolu eklenecektir.

## 🖥 3. Uygulamayı Kullanma

1. Masaüstünüzdeki **Log Analizoru** simgesine çift tıklayarak uygulamayı başlatın.
2. Program açıldığında, "Dosya Yükle" butonuna dokunup cihazınızdaki `.txt` log dosyalarını yükleyerek işlemlere başlayabilirsiniz.
3. Yapılan analizler, PDF dökümleri ve müşteri yedeklemeleri kurulumun olduğu sistemde yerel olarak saklanacaktır.

> **💡 Not:** Herhangi bir internet bağlantısı sadece başlangıçta harita/özel API kullanımı gerekliyse kullanılır. Temel log analiz işlemlerinin tamamı çevrimdışı (offline) çalışmaktadır. Ek bir sunucu kurulumu ya da yapılandırma yapmanıza **gerek yoktur.**
