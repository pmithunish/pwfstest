import json
from bson import ObjectId
from os import environ as env, path
import urllib

from functools import wraps
from flask_cors import cross_origin
from jose import jwt

from flask import Flask, request, jsonify, _app_ctx_stack, Response, send_file
import xlrd
from collections import OrderedDict
import simplejson as json
from flask_pymongo import PyMongo
from flask_mail import Mail, Message
import csv
import time
from werkzeug.utils import secure_filename
from datetime import datetime, time, timedelta
from time import mktime

AUTH0_DOMAIN = 'pmithunish.eu.auth0.com'
API_AUDIENCE = 'http://localhost:5000/'
ALGORITHMS = ["RS256"]

app = Flask(__name__)
mail=Mail(app)

app.config['MONGO_DBNAME'] = 'helloflask'
app.config['MONGO_URI'] = 'mongodb://admin:admin@ds013330.mlab.com:13330/helloflask'
mongo = PyMongo(app)

app.config['MAIL_SERVER']='smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = 'perilwise.email.demo@gmail.com'
app.config['MAIL_PASSWORD'] = 'email.demo'
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
mail = Mail(app)

# Format error response and append status code

def handle_error(error, status_code):
    resp = jsonify(error)
    resp.status_code = status_code
    return resp

def get_token_auth_header():
    """Obtains the access token from the Authorization Header
    """
    auth = request.headers.get("Authorization", None)
    if not auth:
        return handle_error({"code": "authorization_header_missing",
                             "description":
                                 "Authorization header is expected"}, 401)

    parts = auth.split()

    if parts[0].lower() != "bearer":
        return handle_error({"code": "invalid_header",
                             "description":
                                 "Authorization header must start with"
                                 "Bearer"}, 401)
    elif len(parts) == 1:
        return handle_error({"code": "invalid_header",
                             "description": "Token not found"}, 401)
    elif len(parts) > 2:
        return handle_error({"code": "invalid_header",
                             "description": "Authorization header must be"
                                            "Bearer token"}, 401)

    token = parts[1]
    return token

def requires_auth(f):
    """Determines if the access token is valid
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_auth_header()
        jsonurl = urllib.urlopen("https://"+AUTH0_DOMAIN+"/.well-known/jwks.json")
        jwks = json.loads(jsonurl.read())
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
        if rsa_key:
            try:
                payload = jwt.decode(
                    token,
                    rsa_key,
                    algorithms=ALGORITHMS,
                    audience=API_AUDIENCE,
                    issuer="https://"+AUTH0_DOMAIN+"/"
                )
            except jwt.ExpiredSignatureError:
                return handle_error({"code": "token_expired",
                                     "description": "token is expired"}, 401)
            except jwt.JWTClaimsError:
                return handle_error({"code": "invalid_claims",
                                     "description": "incorrect claims,"
                                                    "please check the audience and issuer"}, 401)
            except Exception:
                return handle_error({"code": "invalid_header",
                                     "description": "Unable to parse authentication"
                                                    "token."}, 400)

            _app_ctx_stack.top.current_user = payload
            return f(*args, **kwargs)
        return handle_error({"code": "invalid_header",
                             "description": "Unable to find appropriate key"}, 400)
    return decorated






@app.route("/insuranceData")
@cross_origin(headers=['Content-Type', 'Authorization'])
@cross_origin(headers=["Access-Control-Allow-Origin", "*"])
@requires_auth
def insuranceData():
    output = []
    data = mongo.db.data
    args = request.args
    limit = int(args['limit'])
    skip = int(args['skip'])
    total = data.find().count()
    for s in data.find().skip(skip).limit(limit):
        output.append({'_id': str(s.get('_id')), 'insurerName' : s['insurerName'], 'dependents' : s['dependents'], 'date': s['date'], 'policyType': s['policyType'], 'policyNumber': s['policyNumber'], 'policySubType': s['policySubType'], 'policyHolderName': s['policyHolderName'], 'sumInsured': s['sumInsured'], 'premium': s['premium'], 'commisions': s['commisions'], 'NCB': s['NCB'], 'nominee': s['nominee'], 'claimMade': s['claimMade'], 'customerEmail': s['customerEmail']})
    results = {}
    results = {"totalRecords": total}
    results["results"] = output
    results = json.dumps(results)
    return Response(results, status=200, mimetype='application/json')

@app.route("/exportData")
@cross_origin(headers=['Content-Type', 'Authorization'])
@cross_origin(headers=["Access-Control-Allow-Origin", "*"])
@requires_auth
def exportData():
    output = []
    data = mongo.db.data
    filename = str(time.asctime( time.localtime(time.time()) )) + ".csv"
    f = csv.writer(open(filename, "wb+"))
    f.writerow(["insurer Name", "dependents", "date", "policy type", "policy number", "policy sub type", "policy holder name", "sum insured", "premium", "commisions", "NCB", "nominee/beneficiary", "claim made", "customer email"])
    for s in data.find():
        f.writerow([s['insurerName'], s['dependents'], s['date'], s['policyType'], s['policyNumber'], s['policySubType'], s['policyHolderName'], s['sumInsured'], s['premium'], s['commisions'], s['NCB'], s['nominee'], s['claimMade'], s['customerEmail']])
    return send_file(filename,
                mimetype='text/csv',
                attachment_filename=filename,
                as_attachment=True)

@app.route('/importData', methods = ['POST'])
@cross_origin(headers=['Content-Type', 'Authorization'])
@cross_origin(headers=["Access-Control-Allow-Origin", "*"])
@requires_auth
def importData():
    file = request.files['uploadFile']
    print file, file.filename
    if file:
        file.save(secure_filename(file.filename))
        data = mongo.db.data
        wb = xlrd.open_workbook(file.filename)
        sh = wb.sheet_by_index(0)
        data.remove()
        for rownum in range(1, sh.nrows):
            row_values = sh.row_values(rownum)
            excel_date = int(row_values[0])
            #excel_time = int(row_values[1] * 24 * 3600)
            d = str(datetime.date(datetime.fromordinal(datetime(1900, 1, 1).toordinal() + excel_date - 2)))
            #t = str(time(excel_time//3600, (excel_time%3600)/60, 0))
            data.insert({"date": d, "policyType": row_values[2], "policySubType": row_values[3], "policyNumber": row_values[4], "policyHolderName": row_values[5], "insurerName": row_values[6], "sumInsured": row_values[7], "premium": row_values[8], "commisions": row_values[9], "NCB": row_values[10]*100, "nominee": row_values[11], "dependents": row_values[12], "claimMade": row_values[13], "customerEmail": row_values[14]})
        return 'HTTP_200_OK', 200

@app.route("/customerData")
@cross_origin(headers=['Content-Type', 'Authorization'])
@cross_origin(headers=["Access-Control-Allow-Origin", "*"])
@requires_auth
def customerData():
    args = request.args
    limit = int(args['limit'])
    skip = int(args['skip'])
    data = mongo.db.data
    total = data.find().count()
    output = []
    for s in data.find().skip(skip).limit(limit):
        output.append({'_id': str(s.get('_id')), 'insurerName' : s['insurerName'], 'dependents' : s['dependents'], 'date': s['date'], 'policyType': s['policyType'], 'policyNumber': s['policyNumber'], 'policySubType': s['policySubType'], 'policyHolderName': s['policyHolderName'], 'sumInsured': s['sumInsured'], 'premium': s['premium'], 'commisions': s['commisions'], 'NCB': s['NCB'], 'nominee': s['nominee'], 'claimMade': s['claimMade'], 'customerEmail': s['customerEmail']})
    results = {}
    results = {"totalRecords": total}
    results["results"] = output
    results = json.dumps(results)
    return Response(results, status=200, mimetype='application/json')

@app.route("/updateClaimStatusClose", methods=['PUT'])
@cross_origin(headers=['Content-Type', 'Authorization'])
@cross_origin(headers=["Access-Control-Allow-Origin", "*"])
@requires_auth
def updateClaimStatusClose():
    id = request.json['key']
    claimData = request.json['data']
    data = mongo.db.data
    query = data.update({"_id": ObjectId(str(id))}, {"$set": {"claimMade": "y"}})
    msg = Message(claimData["policyHolderName"] + ': Your "' + claimData["policySubType"] + ' ' + claimData["policyType"] + '" insurance claim has been closed!', sender = 'perilwise.email.demo@gmail.com', recipients = [clamData["customerEmail"]])
    msg.body = 'Hello ' + claimData["policyHolderName"] + ',\n\nThe claim status of your "' + claimData["policySubType"] + ' ' + claimData["policyType"] + '" insurance with a reference number of ' + claimData["policyNumber"] + ' has been set to "CLOSED"! For more details, access your Perilwise Account on any browser.\n\nThank You,\n\nPerilwise Team,\nOne stop destination for all your insurance needs!'
    mail.send(msg)
    print "Message Sent!"
    return 'HTTP_200_OK', 200

@app.route("/updateClaimStatusReopen", methods=['PUT'])
@cross_origin(headers=['Content-Type', 'Authorization'])
@cross_origin(headers=["Access-Control-Allow-Origin", "*"])
@requires_auth
def updateClaimStatusReopen():
    id = request.json['key']
    print id
    data = mongo.db.data
    query = data.update({"_id": ObjectId(str(id))}, {"$set": {"claimMade": "n"}})
    print query
    return 'HTTP_200_OK', 200


if __name__ == "__main__":
    app.run()