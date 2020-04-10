# Docker (dan Kubernetes) untuk Pemula

Salah satu yang menarik dari docker adalah dukungan komunitas yang sangat kuat. Docker bahkan menjadi standar dalam deployment `kubernetes` (kita akan membahas kubernetes di bagian selanjutnya).

Dalam repo ini, saya akan menunjukkan contoh pemanfaatan docker secara nyata. Pada repo ini kita akan membangun aplikasi "notepad" online [seperti ini](https://onlinenotepad.org/notepad) menggunakan `redis` dan `node-js`.

Perlu diingat, bahwa `redis` umumnya dipakai untuk caching, sehingga tidak cocok untuk dijadikan penyimpanan permanen. Jika teman-teman berminat mengembangkan aplikasi ini lebih lanjut, silahkan menggunakan `mysql`, `mongo` atau database engine lain. 

# Yang kita butuhkan

* docker
* docker-compose
* node-js & npm
* kubectl
* akun docker-hub
* akun okteto
* ketekunan dan kemauan untuk belajar :)

> Catatan: 
> * Saya menggunakan ubuntu-WSL dalam windows
> * Untuk menginstall docker di windows, kalian harus menggunakan windows 10 pro dengan hyper-v yang telah diaktifkan
> * Ikuti panduan [ini](https://nickjanetakis.com/blog/setting-up-docker-for-windows-and-wsl-to-work-flawlessly) untuk mengakses docker-for-windows dari dalam WSL
> * Atau gunakan linux :)

# Apa itu Docker? Apa Bedanya dengan Virtual Machine?

Docker adalah platform virtualisasi di level OS. Docker biasa dipakai untuk membuat `container`.

Container sendiri adalah paket software yang terisolasi (saling lepas satu sama lain). Adapun isolasi yang dilakukan hanya di level aplikasi saja. Dengan demikian satu `container` dan `container` lain masih bisa berbagi `kernel` yang sama. Sifat kernel-sharing inilah yang membedakan docker-container dengan virtual machine. 

## Docker

Docker melakukan virtualisasi di level aplikasi, sehingga semua `container` di satu mesin memakai kernel OS yang sama.

Jika kalian memakai linux, maka docker-container kalian akan memakai kernel yang sama dengan OS utama. Sebaliknya, jika teman-teman menggunakan windows/mac, maka akan ada level virtualisasi tambahan untuk emulasi kernel linux.

![](resources/docker.png)

## Virtual Machine

Virtual machine melakukan virtualisasi di level hardware, sehingga antar VM menggunakan kernel, alokasi RAM, dan alokasi CPU yang berbeda. Akibatnya untuk membuat virtual-machine, kita diwajibkan membuat spesifikasi RAM dan CPU untuk setiap VM.

![](resources/vm.png)

# Instalasi docker

Ikuti panduan di [situs resmi docker](https://www.docker.com/get-started)

# Docker Image

Untuk membuat sebuah `docker-container`, kita perlu terlebih dahulu mendefinisikan spesifikasi-nya. Spesifikasi inilah yang kita kenal dengan sebutan `docker-image`.

Saat ini sudah ada banyak sekali `docker-image` siap pakai. Kalian bisa mengunjungi [docker hub](https://hub.docker.com/) untuk mencari docker-image yang kalian butuhkan.

Kebetulan, docker-image untuk redis pun sudah tersedia dan siap dipakai.

Untuk men-download docker-image, kita bisa menggunakan perintah `docker pull`. Berikut contoh penggunaannya:

# Pull Docker Image

```sh
docker image pull redis:latest
```

Kalian juga bisa melihat daftar `docker-images` yang tersedia di komputer lokal dengan menjalankan perintah

```sh
docker image ls
```

> Tips: Biasanya perintah docker memiliki format seperti ini:
>
> `docker <entitas> <aksi> [opsi]`
>
> Jadi kalian bisa sedikit "asal tebak", tidak perlu menghafal semua perintah :)

# Membuat Container Redis

Untuk membuat docker container dengan nama `my-redis` dari image `redis:latest`, kalian bisa menjalankan perintah berikut:

```sh
docker run --name my-redis -p 6379:6379 -d redis:latest
```

Ada beberapa parameter yang sering dipakai pada perintah `docker run`:

* `--name` untuk setting nama container.
* `-p` untuk port forwarding. Format yang dipakai adalah `-p <host-port>:<container-port>`. Jadi seandainya kita ingin port `6379` pada container kita bisa diakses melalui port `4000` pada localhost, maka kita bisa melakukan perintah ini: `docker run --name my-redis -p 4000:6379 -d redis:latest`.
* `-d` untuk men-spesifikasikan nama image.
* `-e` untuk setting environmant variable. Format yang digunakan adalah `-e <nama-variable>=<isi-variable>`. Untuk saat ini, belum ada environment yang perlu di set.
* `-v` untuk membuat persistance volume di host. Format yang digunakan adalah `-v <path-di-host>:<path-di-container>`. Untuk saat ini, kita tidak akan menggunakan volume.

> Catatan: 
> * Jalankan `docker start my-redis` dan `docker stop my-redis` untuk menjalankan atau memberhentikan container `my-redis`.
> * Jalankan `docker ps` untuk melihat list container yang sedang berjalan.

## Bermain dengan Redis (Bonus)

Pada dasarnya, redis banyak digunakan untuk caching. Redis menyimpan cache kita dalam RAM. Oleh sebab itu, `io-access-time` relatif lebih kecil daripada RDBMS seperti MySQL yang melakukan penyimpanan di harddisk.

Karena ini pula, sangat tidak disarankan untuk menggunakan redis sebagai media penyimpanan utama (seperti yang akan kita lakukan sebentar lagi... he3x).

Cache pada redis disimpan dengan format `key-value`. Jika pada komputer kalian terinstall redis-cli atau aplikasi redis-client lain, kalian bisa mencoba perintah-perintah berikut:

```
> set password rahasia
OK

> get password
"rahasia"

> keys *
1) "password"

> del password
(integer) 1
```

# Membuat Web-app

Kembali ke tujuan awal yang sudak kita sepakati tadi, kita ingin membuat aplikasi notepad-online. Untuk kita membutuhkan sebuah web-application.

Coding web-application kita terletak di folder `app` dari repository ini.

Untuk menjalankannya, kalian bisa menuliskan perintah berikut:

```sh
cd app
npm install
node index
```

Aplikasi akan berjalan di port 3000. Kalian bisa mengaksesnya menggunakan alamat `http://localhost:3000` pada browser.

Aplikasi yang sudah kita buat ini memiliki beberapa konfigurasi yang bisa diubah melalui environment variable.

Secara khusus perhatikan bagian kode ini:

```javascript
    const httpPort = process.env.HTTP_PORT || 3000;
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
```

Ketiga baris itu memungkinkan kalian bisa mengubah isi variable `httpPort`, `redisHost`, dan `redisPort` tanpa mengubah kode sama sekali.

Untuk mencobanya, coba lakukan perintah berikut

```sh
HTTP_PORT=4000 node index
```

# Membuat Dockerfile untuk Web-app

Nah, sekarang kita ingin meng-kontainer kan aplikasi kita. Untuk melakukan ini, kita bisa harus terlebih dahulu mendefinisikan spesifikasi `docker-image`.

Spesifikasi `docker-image` biasanya disimpan pada file `Dockerfile`.

Berikut isi `Dockerfile` untuk Web-app kita:

```dockerfile
# image kita adalah turunan dari node:latest
FROM node:latest

# di sini kita mendefinisikan bahwa working directory di container adalah 
# /usr/src/app
WORKDIR /usr/src/app

# di sini kita meng-copy package.json dan package-lock.json ke 
# working directory container (./)
COPY package*.json ./

# setelah package.json dan package-lock.json ter-copy ke 
# working directory container, kita menjalankan npm install untuk 
# men-download library external ke container
RUN npm install

# terakhir, kita meng-copy semua source yang ada ke working directory container
COPY . .

# bagian ini sebenarnya tidak terlalu penting, hanya untuk dokumentasi saja, 
# supaya orang lain tahu bahwa aplikasi kita ter-expose di port 3000 
# tanpa perlu membuka source-code kita.
EXPOSE 3000

# untuk menjalankan aplikasi kita, perintah yang perlu dieksekusi adalah 
# "node index"
CMD [ "node", "index" ]
```

# Memakai Docker-compose

Satu hal lagi yang menarik, kita bisa mem-bundle sejumlah docker-image supaya bisa didistribusikan dengan lebih mudah.

Dengan demikian, kalian hanya membutuhkan `docker` dan `docker-compose` untuk menjalankan aplikasi notepad-online kita. Kalian bahkan tidak perlu menginstall Node.js !!!

Berikut adalah `docker-compose.yaml` yang kita gunakan:

```yaml
version: '2.0'
services:

  # web adalah alias untuk web-app kita
  web:
    build: ./app # aplikasi kita menggunakan Dockerfile di folder `./app`
    ports:
        - "8080:3000" # kalian bisa mengakses aplikasi kita melalui localhost:8080
    environment:
        - HTTP_PORT=3000
        - REDIS_PORT=6379
        - REDIS_HOST=redis # perhatikan, di sini kita menggunakan alias
    depends_on:
        - redis

  # redis adalah alias untuk redis container
  redis:
    image: redis:latest # untuk redis, kita akan menggunakan image redis:latest
    ports:
        - "6379:6379" # kalian bisa mengakses redis melalui localhost:6379
```

Untuk menjalankan docker-compose, kalian bisa menuliskan perintah `docker-compose up`

Setelah menjalankan docker-compose, kalian bisa coba menjalankan perintah `docker ps`.

Di sini kalian akan melihat bahwa nama container yang dibuat dengan menggunakan docker-compose adalah `<nama-folder>_<service-name>`.

# Mempublikasi Docker-image

Bagaimana jika kita ingin mendistribusikan docker-image kita tanpa mendistribusikan source code?

Dalam kasus seperti itu, kita bisa mempublikasikan image kita ke docker-hub (atau registry lain).

Untuk itu, pertama-tama kalian harus memiliki akun di `hub.docker.com`.

Setelah memiliki akun di docker-hub, kalian perlu membuat `repository`. Dalam kasus ini, saya membuat repository `gofrendi/notepad`.

```sh
docker login
docker tag docker-workshop_web <user-name>/notepad
docker push <user-name>/notepad
```

> Catatan: saat tulisan ini dibuat, ada bug pada package `docker-compose` ubuntu. Jika kalian menggunakan WSL-ubuntu, maka kalian bisa menjalankan perintah di atas dengan menggunakan power-shell.

Kini orang lain bisa membuat docker-compose sekalipun tak memiliki source-code kita:

```yaml
version: '2.0'
services:

  web:
    image: gofrendi/notepad:latest
    ports:
        - "8080:3000"
    environment:
        - HTTP_PORT=3000
        - REDIS_PORT=6379
        - REDIS_HOST=redis
    depends_on:
        - redis

  redis:
    image: redis:latest
    ports:
        - "6379:6379"
```

# Kubernetes

Kubernetes adalah container-orchestration-system. Secara sederhana, kubernetes memungkinkan kalian untuk melakukan scaling, restart service, dan deployment secara lebih mudah.

Dalam kesempatan ini kita belum akan membahas kubernetes secara terlalu detail.

Saat ini, salah satu penyedia layanan kubernetes yang cukup ramah pemula dan tidak perlu credit-card adalah [okteto](https://okteto.com/)

Kalian bisa mencoba membuat akun di okteto, dan membuat namespace.

Usai membuat namespace, kalian bisa mendownload credential `okteto-kube.config` dan menjalankan perintah berikut:

```sh
export KUBECONFIG=./okteto-kube.config
kubectl get all
kubectl apply -f redis-k8s.yaml
kubectl apply -f notepad-k8s.yaml
```

