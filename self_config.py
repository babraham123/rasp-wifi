from flask import Flask, render_template, redirect, url_for
app = Flask(__name__)

@app.route("/")
@app.route("")
def index():
    network_info = "WPA"
    return render_template('index.html', wifi=network_info)

@app.route('/wifi', methods=['POST'])
def wifi():
    if request.method == 'POST':
        ssid = request.forms.get('ssid')
        pswd = request.forms.get('password')
        save_credentials(ssid, pswd)
        redirect(url_for('success'))
    else:
        return "An error has occurred"

@app.route("/success")
def success():
    # trigger reboot
    return render_template('success.html')


def save_credentials(ssid, pswd):
    # save to file
    pass


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=80)