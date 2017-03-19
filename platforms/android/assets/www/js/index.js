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
        var api_end_point = app.api_end_point + '&device_id=' + encodeURI( device.uuid + '-' + device.serial );
        
        var user_id = app.storage.get("user_id") || 0;
        
        if ( user_id ) {
            api_end_point += '&user_id=' + user_id;
        }
        
        //params.client_device_id = device.uuid;
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
        selection = selection || '';
        
        var srcType = selection == 'camera' 
            ? Camera.PictureSourceType.CAMERA
            : Camera.PictureSourceType.PHOTOLIBRARY;

        var options = app.setOptions(srcType);
        var func = app.createNewFileEntry;

        navigator.camera.getPicture(function cameraSuccess(imageUri) {
            $('.app_delayed_button').show();
            
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
            
             mediaType: Camera.MediaType.PICTURE, // camera
//            sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY, // library
            targetWidth: 1024,
            //targetHeight: 512,
            saveToPhotoAlbum: true,
            correctOrientation: true  //Corrects Android orientation quirks
        };
        
        return options;
    },
    
    displayImage : function (imgUri) {
        var elem = document.getElementById( 'image_file' );
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

        var params = {};
        params.value1 = "test";
        params.item_id = app.util.get_param('item_id') || 0;
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
    },
    
    redirect : function (r) {
        window.open( r, '_self' );
    },
    
    util : {
        get_query_params : function (qs) {
            var params = {}, tokens, re = /[?&]?([^=]+)=([^&]*)/g;

            while (tokens = re.exec(qs)) {
                params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
            }

            return params;
        },
        
        // app.util.get_param();
        // 
        // http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
        get_param : function (name, url) {
            url = url || window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        },
        
        // is welcome
        is_page : function (name) {
            var url = window.location.href;
            url = url.toLowerCase();
            name = name.toLowerCase();
            
            return url.indexOf(name) != -1;
        }
    },
    
    storage : {
        get : function ( key ) {
            var storage = window.localStorage;
            var value = storage.getItem(key); // Pass a key name to get its value.
            value = value || '';
            return value;
        },

        set : function ( key, value ) {
            var storage = window.localStorage;
            storage.setItem(key, value); // Pass a key name and its value to add or update that key.
            return value;
        },
        
        remove: function ( key ) {
            var storage = window.localStorage;
            storage.removeItem(key); // Pass a key name to remove that key from storage.
        }
    }
    
};

app.initialize();

$(document).ready(function() {
    $( document ).ajaxError(function(event, request, settings) {
        $( ".result" ).html( "Error: There was an error while making the request to: " 
                + settings.url );
    });

    var user_id = app.storage.get("user_id") || 0;
    
    if ( 1 ) {
        if ( user_id ) {
            var is_tutor = app.storage.get("is_tutor") || 0;

            if ( app.util.is_page( 'index' ) || app.util.is_page( 'welcome' ) ) {
                if (is_tutor) {
                    app.redirect( 'member.html?tab=problems' );
                } else {
                    app.redirect( 'member.html?tab=submit' );
                }
            }

            //alert("user_id: "+ user_id);
        } else if ( ! app.util.is_page( 'welcome' ) && ! app.util.is_page( 'join' )  ) {
            app.redirect( 'welcome.html' );
        }
    }

    $('#takePic,#app_q_pic_from_gallery').on('click', function () {
        app.openCamera( 'gallery' );
    } );

    $('#app_q_pic_from_camera').on('click', function () {
        app.openCamera( 'camera' );
    } );
    
    $('#login_join_form').on('submit', function (e) {
        e.preventDefault();
        $('.result').html( 'Loading...' );
        
        // Assign handlers immediately after making the request,
        // and remember the jqxhr object for this request
        var jqxhr = $.post(
            app.get_api_end_point() + '&cmd=user.join', 
            $(this).serialize()
        )
        .done(function(json) {
            console.log(json);
            //alert( "success" + json.status + ' ' + json.data.user_id);
            app.storage.set( 'user_id', json.data.user_id );
            app.storage.set( 'email', json.data.email );
            $('.result').html( 'Done' );
            app.redirect( 'member.html' );
        });
        
        return false;
    } );
    
    // Ask
    $('#ask_question_form').on( 'submit', function (e) {
        e.preventDefault();
        
        // Assign handlers immediately after making the request,
        // and remember the jqxhr object for this request
        var jqxhr = $.post(
            app.get_api_end_point() + '&cmd=item.create', 
            $(this).serialize()
        )
        .done(function(json) {
            //alert( "success" + json.status);
            app.redirect( 'q_ask2.html?item_id=' + json.data.item_id );
        });
 
        return false;
    } );
    
    // Ask
    $('#ask_question_form2').on( 'submit', function (e) {
        e.preventDefault();
        app.redirect( 'q_ask3.html' );
        return false;
    } );
    
    // app_logout_btn
    $('#app_logout_btn').on( 'click', function (e) {
        e.preventDefault();
        app.storage.remove("user_id");
        app.redirect( 'welcome.html' );
        return false;
    } );
});
