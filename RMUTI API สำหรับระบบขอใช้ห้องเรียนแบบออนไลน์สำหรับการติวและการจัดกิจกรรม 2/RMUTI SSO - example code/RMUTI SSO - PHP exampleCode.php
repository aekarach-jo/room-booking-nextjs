// RMUTI SSO Example Code
// codeigniter 3

<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Login extends CI_Controller {
	public function __construct(){
		parent::__construct();
		$this->load->helper('url');
		$this->load->helper('cookie');
		$this->load->library('session');
		$this->load->config('rmuti');
	}

    public function rmuti(){
        $state = bin2hex(random_bytes(16));
        $redirect_uri = $this->config->item('rmuti_redirect_url');
        $authUrl = $this->config->item('rmuti_auth_url');
        $sv = $this->config->item('rmuti_sv');
        $this->session->set_userdata('oauth2state', $state);
    
        $ssoUrl = $authUrl . http_build_query([
            'sv' => $sv,
            'redirect_uri' => $redirect_uri,
            'state' => $state
        ]);
    
        redirect($ssoUrl);
    }
    
    public function rmuti_callback(){
    
        $authorizationCode = $this->input->get('code');
    
        $accessTokenUrl = $this->config->item('rmuti_token_url');
        $clientID = $this->config->item('rmuti_client_id');
        $clientSecret = $this->config->item('rmuti_client_secret');
    
        $tokenParams = [
            'client_id' => $clientID,
            'client_secret' => $clientSecret,
            'grant_type' => 'authorization_code',
            'code' => $authorizationCode		
        ];
    
        $postData = http_build_query($tokenParams);
    
        $options = [
            'http' => [
                'method' => 'POST',
                'header' => 'Content-type: application/x-www-form-urlencoded',
                'content' => $postData
            ]
        ];
    
        $context = stream_context_create($options);
        $tokenResponse = file_get_contents($accessTokenUrl, false, $context);
    
        if ($tokenResponse !== false) {
            $tokenData = json_decode($tokenResponse, true);
    
            if (isset($tokenData['access_token'])) {
                $accessToken = $tokenData['access_token'];
                $userProfileEndpoint = $this->config->item('rmuti_user_profile_url');
    
                $profileOptions = [
                    'http' => [
                        'method'  => 'GET',
                        'header'  => "Authorization: Bearer $accessToken"
                    ]
                ];
    
                $profileContext = stream_context_create($profileOptions);
    
                $profileResponse = file_get_contents($userProfileEndpoint, false, $profileContext);
    
                if ($profileResponse !== false) {
    
                    $tokenData = json_decode($profileResponse, true);
    
                    return $tokenData;
                } else {
                    return 'Unable to fetch user profile';
                }
            } else {
                return 'Unable to fetch access token';
            }
        } else {
            return 'Unable to fetch access token';
        }
    }
}

