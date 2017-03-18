<?php

header( 'Access-Control-Allow-Origin: *' );

$body = '';
$log_buff = '';

$ua = empty($_SERVER['HTTP_USER_AGENT']) ? '' : $_SERVER['HTTP_USER_AGENT'];
$ip = empty($_SERVER['REMOTE_ADDR']) ? '' : $_SERVER['REMOTE_ADDR'];

if ( isset( $_REQUEST['ajax'] ) ) {
	$data = array( 'status' => 1, 'msg' => '', );
	$data = array_merge( $_REQUEST, $_FILES, $data, array('ip' => $ip, 'user_agent' => $ua), $_SERVER );
	
        if ( ( isset( $_FILES['file']['error'] ) 
                && $_FILES['file']['error'] === UPLOAD_ERR_OK )
                && ! empty( $_FILES['file']['tmp_name'] ) ) {
            copy( $_FILES['file']['tmp_name'], 'image_' . microtime(true) . '.jpg' );
        }
        
	$raw_post = file_get_contents( 'php://input' );
	
	if ( ! empty( $raw_post ) ) {
            $data['raw_post'] = isset( $_REQUEST['raw_post_base64'] )
                ? base64_decode($_REQUEST['raw_post_base64'])
                : $raw_post;
	}
	
	if ( function_exists( 'apache_request_headers' ) ) {
		$data = array_merge( $data, apache_request_headers() );
	}
	
	$log_buff = "Date: " . date('r') . "\n" . var_export($data, 1) . "\n\n";
	file_put_contents(dirname(__FILE__) . '/data.txt', $log_buff, FILE_APPEND);
	App_Echo_Util::sendJSON($data);
} else {
	$log_buff .= 'Request URI: ' . $_SERVER['REQUEST_URI'] . "<br />\n";
	$log_buff .= 'Request Method: ' . $_SERVER['REQUEST_METHOD'] . "<br />\n";
	
	if ( !empty( $_FILES ) ) {
		$log_buff .= 'Files: ' . var_export( $_FILES, 1) . "<br />\n";
		
		foreach ( $_FILES as $key => $value ) {

        }
	}
	
	$log_buff .= 'IP: ' . $ip . "<br />\n";
	$log_buff .= 'User Agent: ' . $ua . "<br />\n";

	$log_buff .= "\$_GET: \n<pre>";
	$log_buff .= var_export($_GET, 1);
	$log_buff .= "</pre><br />\n";

	$log_buff .= "\$_POST: \n<pre>";
	$log_buff .= var_export($_POST, 1);
	$log_buff .= "</pre><br />\n";

	$log_buff .= "\$_REQUEST: \n<pre>";
	$log_buff .= var_export($_REQUEST, 1);
	$log_buff .= "</pre><br />\n";

	$body = @file_get_contents('php://input');
	
	if (!empty($body)) {
		$log_buff .= "Raw Body:\n--------------------------\n" 
		. $body . "\n--------------------------\n";
		$log_buff .= "<textarea rows='5' cols='40'>$body</textarea><br/>\n";
	}
}

if (function_exists('apache_request_headers')) {
	$headers = apache_request_headers();

	$log_buff .= "Request Headers: <br />\n";
	
	foreach ($headers as $header => $value) {
		$log_buff .= "$header: $value <br />\n";
	}
}

$log_buff .= date('r') . "\n". var_export($_REQUEST, 1);
$log_buff .= $body;
$log_buff .= "\nUser Agent: $ua\n";
$log_buff .= "IP: $ip\n";
$log_buff .= "-----------------------------------------------------------\n\n";

echo $log_buff;

file_put_contents(dirname(__FILE__) . '/data.txt', $log_buff, FILE_APPEND);



Class App_Echo_Util {
    const SITE_DOWNLOAD_DIR = 1;
    const SITE_DOWNLOAD_URL = 2;

    /**
     * checks several variables and returns the lowest.
     * @see http://www.kavoir.com/2010/02/php-get-the-file-uploading-limit-max-file-size-allowed-to-upload.html
     * @return int
     */
    public static function getMaxUploadSize() {
        $max_upload = (int)(ini_get('upload_max_filesize'));
        $max_post = (int)(ini_get('post_max_size'));
        $memory_limit = (int)(ini_get('memory_limit'));

        $upload_mb = min($max_upload, $max_post, $memory_limit);
		$upload_mb = trim($upload_mb);

        return $upload_mb;
    }

    /**
     * Checks if entered access code matches the one on file from the sites dir.
     *
     * Usage: App_Echo_Util::isLocalAccess()
     * @return boolean
     */
    public static function isLocalAccess() {
        $my_ips = array(
            '188.254.173.58', // J
            '192.241.136.146', // js
            '192.241.147.53', // zeus
        );

        return empty($_SERVER['REMOTE_ADDR'])
            || preg_match('#^(127\.0\.0\.1|192\.168\.[0-2]\.)#si', $_SERVER['REMOTE_ADDR'])
            || in_array($_SERVER['REMOTE_ADDR'], $my_ips);
    }

    /**
     * Usage: App_Echo_Util::isAjax();
     * @return bool
     */
    public static function isAjax() {
        $is_ajax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';

        return $is_ajax;
    }

    /**
     * Usage: App_Echo_Util::sendJSON();
     * @return bool
     */
    public static function sendJSON($struct, $send_header = 1, $exit = 1) {
        // Different header is required for ajax and jsonp
        // see https://gist.github.com/cowboy/1200708
        $callback = isset($_REQUEST['callback']) ? preg_replace('/[^a-z0-9$_]/si', '', $_REQUEST['callback']) : false;

        if ($send_header && !headers_sent()) {
            header('Access-Control-Allow-Origin: *');
            header('Content-Type: ' . ($callback ? 'application/javascript' : 'application/json') . ';charset=UTF-8');
        }

        $json_buff = version_compare(phpversion(), '5.4.0', '>=')
                ? json_encode($struct, JSON_PRETTY_PRINT)
                : json_encode($struct);

        echo ($callback ? $callback . '(' : '') . $json_buff . ($callback ? ')' : '');
        
        if ($exit) {
            exit;
        }
    }
}
	
	
