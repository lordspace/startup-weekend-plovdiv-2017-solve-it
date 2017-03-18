/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
		//window.location.href = 'http://solveit.co/';
		//var onInApp = window.open( 'http://solveit.co', '_self', 'location=no,hidden=yes,closebuttoncaption=Done,toolbar=no');
		//window.location = 'http://solveit.co/';
		//window.open( 'http://solveit.co/', '_self' );
		//var ref = cordova.InAppBrowser.open('http://solveit.co/', '_blank', 'location=yes');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
		//window.location = 'http://solveit.co/app/';
    },
    
    openCamera : function (selection) {
        var srcType = Camera.PictureSourceType.CAMERA;
        var options = app.setOptions(srcType);
        var func = app.createNewFileEntry;

        navigator.camera.getPicture(function cameraSuccess(imageUri) {
            app.displayImage(imageUri);
            // You may choose to copy the picture, save it somewhere, or upload.
            func(imageUri);
        }, function cameraError(error) {
            console.debug("Unable to obtain picture: " + error, "app");
        }, options);
    },
    
    setOptions : function (srcType) {
        var options = {
            // Some common settings are 20, 50, and 100
            quality: 75,
            allowEdit: false,
            destinationType: Camera.DestinationType.FILE_URI,
            // In this app, dynamically set the picture source, Camera or photo gallery
            sourceType: srcType,
            encodingType: Camera.EncodingType.JPEG,
            
            // mediaType: Camera.MediaType.PICTURE, // camera
            sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY, // library
            targetWidth: 1024,
            //targetHeight: 512,
            saveToPhotoAlbum: true,
            correctOrientation: true  //Corrects Android orientation quirks
        };
        
        return options;
    },
    
    displayImage : function (imgUri) {
        var elem = document.getElementById( 'imageFile' );
        elem.src = imgUri;
    },
    
    createNewFileEntry : function (imgUri) {
        window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function success(dirEntry) {
            // JPEG file
            dirEntry.getFile("tempFile.jpeg", { create: true, exclusive: false }, function (fileEntry) {
                app.upload(fileEntry);
                
                // Do something with it, like write to it, upload it, etc.
                // writeFile(fileEntry, imgUri);
                console.log("got file: " + fileEntry.fullPath);
                //alert(fileEntry.fullPath);
                // displayFileData(fileEntry.fullPath, "File copied to");

            }, app.onErrorCreateFile);

        }, app.onErrorResolveUrl);
    },
    
    upload : function (fileEntry) {
        // !! Assumes variable fileURL contains a valid URL to a text file on the device,
        var fileURL = fileEntry.toURL();

        var success = function (r) {
            console.log("Successful upload...");
            console.log("Code = " + r.responseCode);
            // displayFileData(fileEntry.fullPath + " (content uploaded to server)");
            alert("Done " + r.bytesSent + ' bytes' );
        };

        var fail = function (error) {
            alert("An error has occurred: Code = " + error.code);
        };

        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
        options.mimeType = "image/jpeg";
        options.chunkedMode = false;
//        options.mimeType = "text/plain";

        var params = {};
        params.value1 = "test";
        params.value2 = "param";
        //params.client_device_id = device.uuid;

        options.params = params;

        var SERVER = 'http://solveit.co/app/?cmd=image.upload&user_id=123&ajax=1';
        
        var ft = new FileTransfer();
        // SERVER must be a URL that can handle the request, like
        // http://some.server.com/upload.php
        ft.upload(fileURL, encodeURI(SERVER), success, fail, options);
    },

    onErrorCreateFile : function (r) {
        alert('error: onErrorCreateFile');
    },
    
    onErrorResolveUrl : function (r) {
        alert('error: onErrorResolveUrl');
    }
    
};

app.initialize();


$(document).ready(function(){
    /*$("button").click(function(){
        $("#div1").fadeIn();
        $("#div2").fadeIn("slow");
        $("#div3").fadeIn(3000);
    });*/
    
    $('#takePic').on('click', function () {
        app.openCamera();
    } );
});