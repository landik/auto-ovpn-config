###Автоматический конфигуратор конфиг файлов для openvpn
___
Файл конфигурации config.js
```javascript
module.exports = {
    template: 'template.conf',
    extension: 'conf',
    from: 'files',
    to: 'complete',
};
```
*template* - Имя файла шаблона( файл шаблона должен располагаться в директории со скриптом)

*extension* - Расширение у итоговых файлов конфигурации (client._conf_)

*from* - Название папки в которой будут находиться сертификаты и ключи (папка должна находиться в директории со скриптом)

*to* - Название папки в которую будут сложены готовые конфигурации (Папка будет создана в директории со скриптом)

___
В шаблоне необходимо указать куда будут вставлены ключи и сертификаты, следующими конструкциями:

-%TLS% - ta.key

-%CA% - ca.crt

-%KEY% - user.key

-%CERT% - user.crt
___
Работает все просто, скидываете все ключи и сертификаты в папку FROM.
В папке обязательно должны быть ta.key, ca.crt и пара ключ-сертификат клиента