from flask import Flask, render_template, redirect, url_for, request
import shlex, subprocess, json
app = Flask(__name__)

@app.route("/")
@app.route("")
def index():
    # route based off of ip address
    ip = request.remote_addr
    ssids = get_networks()
    if not ssids:
        return render_template('failure.html')
    data = {'networks':ssids, 'ip':ip}
    return render_template('index.html', wifi=data)

@app.route('/wifi', methods=['POST'])
def wifi():
    if request.method == 'POST':
        ssid = request.forms.get('ssidInput')
        pswd = request.forms.get('passwordInput')
        wep = request.forms.get('wepInput')
        save_credentials(ssid, pswd, wep)
        redirect(url_for('success'))
    else:
        return "<h1>An error has occurred</h1>"

@app.route("/success")
def success():
    # trigger reboot
    return render_template('success.html')

@app.route("/reboot")
def reboot():
    cmd = "sudo reboot"
    args = shlex.split(cmd)
    p = subprocess.Popen(args)

def get_networks():
    # scan wifi
    cmd = "iwlist wlan0 scan"
    ssids = []
    args = shlex.split(cmd)
    p = subprocess.Popen(args)
    (stdout, stderr) = subprocess.communicate()
    lines = stdout.split("\n")
    for line in lines:
        if "ESSID" in line:
            words = line.split('"')
            if words[-2]:
                ssids.append(words[-2])
    return ssids

def save_credentials(ssid, pswd, wep):
    # save to file
    is_wpa = True
    if wep == 1:
        is_wpa = False
    with open('/etc/wpa_supplicant/wpa_supplicant.conf') as f:
        f.write( get_config(ssid, pswd, is_wpa) )

def get_config(ssid, pswd, is_wpa=True):
    if is_wpa:
        config = """\nnetwork={
            ssid="%s"
            psk="%s"
        }\n""" % (str(ssid), str(pswd))
    else:
        config = """\nnetwork={
            ssid="%s"
            wep_key0="%s"
            key_mgmt=NONE
        }\n""" % (str(ssid), str(pswd))

    title = "ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev\nupdate_config=1\n"
    config = title + config
    return config

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=80)

