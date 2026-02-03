from flask import Flask, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

def get_live_stations():
    # 1. Fetch Station Info (Static details)
    info_url = "https://gbfs.citibikenyc.com/gbfs/en/station_information.json"
    stations_info = {s['station_id']: s for s in requests.get(info_url).json()['data']['stations']}

    # 2. Fetch Station Status (Real-time)
    status_url = "https://gbfs.citibikenyc.com/gbfs/en/station_status.json"
    stations_status = requests.get(status_url).json()['data']['stations']

    processed_data = []
    for status in stations_status:
        sid = status['station_id']
        if sid not in stations_info: continue

        info = stations_info[sid]
        capacity = info['capacity']
        available = status['num_bikes_available']

        # Scoring
        emptiness_risk = 1 - (available / capacity) if capacity > 0 else 0

        processed_data.append({
            "id": sid,
            "legacy_id": sid,  # Add legacy_id for frontend compatibility
            "lon": info['lon'],
            "lat": info['lat'],
            "name": info['name'],
            "capacity": capacity,
            "risk": emptiness_risk,
            "bikes": available,
            "num_bikes_available": available,  # Add for frontend compatibility
            "pulse_speed": 1 if emptiness_risk > 0.8 else (2 if emptiness_risk > 0.4 else 4)
        })
    return processed_data

@app.route('/api/stations', methods=['GET'])
def stations():
    try:
        data = get_live_stations()
        return jsonify({
            "success": True,
            "count": len(data),
            "stations": data
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    print("Starting NYC Bike Pulse API...")
    print("API available at: http://localhost:5000")
    print("Endpoints:")
    print("  - GET /api/stations - Get all station data")
    print("  - GET /api/health - Health check")
    app.run(debug=True, host='0.0.0.0', port=5000)