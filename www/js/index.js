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
    api_end_point : 'http://solveit.co/app/?ajax=1',
    
    // Application Constructor
    get_api_end_point: function() {
        var api_end_point = app.api_end_point + '&user_id=123';
        return api_end_point;
    },
    
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        //this.receivedEvent('deviceready');
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
            //func(imageUri);
            var fileEntry;
            
            if (imageUri.indexOf('file:') == 0) {
                resolveLocalFileSystemURI(imageUri, function(e) {
                    fileEntry = e;
                    app.upload(fileEntry);
                    app.logCallback('resolveLocalFileSystemURI()', true)(e);
                }, app.logCallback('resolveLocalFileSystemURI()', false));
            } else {
                var path = imageUri.replace(/^file:\/\/(localhost)?/, '').replace(/%20/g, ' ');
                fileEntry = new FileEntry('image_name.png', path);
                app.upload(fileEntry);
            }
            
            /*window.resolveLocalFileSystemURL( imageUri, function success(fileEntry) {
                alert(fileEntry.fullPath);
                console.log("got file: " + fileEntry.fullPath);
                // displayFileData(fileEntry.fullPath, "File copied to");
                app.upload(fileEntry);
            }, app.onErrorResolveFile);*/

        }, function cameraError(error) {
            console.debug("Unable to obtain picture: " + error, "app");
        }, options);
    },
    
    logCallback : function (apiName, success) {
        return function() {
            app.logCallback('Call to ' + apiName + (success ? ' success: ' : ' failed: ') + JSON.stringify([].slice.call(arguments)));
        };
    },
    
    setOptions : function (srcType) {
        var options = {
            // Some common settings are 20, 50, and 100
            quality: 75,
            //allowEdit: false,
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
//        window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function success(dirEntry) {
        window.resolveLocalFileSystemURL( imgUri, function success(dirEntry) {
            // JPEG file
            dirEntry.getFile(dirEntry, { create: true, exclusive: false }, function (fileEntry) {
                // Do something with it, like write to it, upload it, etc.
                // writeFile(fileEntry, imgUri);
                alert(fileEntry.fullPath);
                console.log("got file: " + fileEntry.fullPath);
                // displayFileData(fileEntry.fullPath, "File copied to");
                app.upload(fileEntry);

            }, app.onErrorCreateFile);

        }, app.onErrorResolveUrl);
    },
    
    upload : function (fileEntry) {
        // !! Assumes variable fileURL contains a valid URL to a text file on the device,
        var fileURL = fileEntry.toURL();
        
console.log( JSON.stringify(fileURL) );

        var success = function (r) {
            console.log("Successful upload...");
            console.log("Code = " + r.responseCode);
            // displayFileData(fileEntry.fullPath + " (content uploaded to server)");
            console.log("bytesSent: " + r.bytesSent );
        };

        var fail = function (error) {
            alert("An error has occurred: Code = " + error.code);
        };

        var options = new FileUploadOptions();
        options.fileKey = "file";
//        options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
        options.fileName = 'photo.jpg';
        options.mimeType = "image/jpeg";
        options.chunkedMode = false;
        //options.mimeType = "text/plain";

        var params = {};
        params.value1 = "test";
        params.value2 = "param";
        //params.client_device_id = device.uuid;

        options.params = params;

        var api_end_point = app.get_api_end_point() + '&cmd=image.upload';
        
        var ft = new FileTransfer();
        // SERVER must be a URL that can handle the request, like
        // http://some.server.com/upload.php
        ft.upload(fileURL, encodeURI(api_end_point), success, fail, options);
    },

    onErrorCreateFile : function (r) {
        alert('error: onErrorCreateFile');
        console.log( JSON.stringify(r) );
    },

    onErrorResolveFile : function (r) {
        alert('error: onErrorResolveFile');
        console.log( JSON.stringify(r) );
    },
    
    onErrorResolveUrl : function (r) {
        alert('error: onErrorResolveUrl');
        console.log( JSON.stringify(r) );
    }
    
};

app.initialize();


$(document).ready(function(){
    $( document ).ajaxError(function(event, request, settings) {
        $( ".result" ).html( "Error: There was an error while making the request to: " 
                + settings.url );
    });

    /*$("button").click(function(){
        $("#div1").fadeIn();
        $("#div2").fadeIn("slow");
        $("#div3").fadeIn(3000);
    });*/
    
    $('#takePic').on('click', function () {
        app.openCamera();
    } );
    
    $('#login_join_form').on('submit', function (e) {
        e.preventDefault();
        
        // Assign handlers immediately after making the request,
        // and remember the jqxhr object for this request
        var jqxhr = $.post(
            app.get_api_end_point() + '&cmd=user.join', 
            $(this).serialize()
        )
        .done(function(json) {
          alert( "success" + json.status);
        })
        .fail(function() {
          alert( "error" );
        })
        .always(function() {
          alert( "finished" );
        });
        
        return false;
    } );
});