import React, { useEffect, useState } from 'react';  
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap, ZoomControl } from 'react-leaflet';  
import L from 'leaflet';  
import 'leaflet/dist/leaflet.css';  
import './Map.css';  

// حل مشکل آیکون‌های Leaflet  
delete L.Icon.Default.prototype._getIconUrl;  
L.Icon.Default.mergeOptions({  
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',  
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',  
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',  
});  

// آیکون موقعیت فعلی  
const currentLocationIcon = new L.Icon({  
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwODVmZiIgd2lkdGg9IjI0cHgiIGhlaWdodD0iMjRweCI+PHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjgiLz48L3N2Zz4=',  
  iconSize: [24, 24],  
  iconAnchor: [12, 12],  
  popupAnchor: [0, -12],  
});  

// کامپوننت کنترل خودکار مرکز نقشه  
const AutoCenterMap = ({ position, follow }) => {  
  const map = useMap();  
  
  useEffect(() => {  
    if (position && position.coords && follow) {  
      map.setView([position.coords.lat, position.coords.lng], map.getZoom());  
    }  
  }, [position, follow, map]);  
  
  return null;  
};  

const MapView = ({   
  currentLocation,   
  locationHistory = [],   
  savedLocations = [],   
  followUser = true,  
  initialZoom = 15  
}) => {  
  const [map, setMap] = useState(null);  
  const [isFollowing, setIsFollowing] = useState(followUser);  
  
  // مسیر طی شده  
  const pathPoints = locationHistory  
    .filter(loc => loc?.coords?.lat && loc?.coords?.lng)  
    .map(loc => [loc.coords.lat, loc.coords.lng]);  
  
  // تغییر وضعیت تعقیب کاربر  
  const toggleFollow = () => {  
    setIsFollowing(prev => !prev);  
    if (!isFollowing && currentLocation?.coords) {  
      map?.setView([currentLocation.coords.lat, currentLocation.coords.lng], map?.getZoom() || initialZoom);  
    }  
  };  
  
  // محاسبه مرکز اولیه نقشه  
  const getInitialCenter = () => {  
    if (currentLocation?.coords) {  
      return [currentLocation.coords.lat, currentLocation.coords.lng];  
    }  
    if (locationHistory.length > 0 && locationHistory[0]?.coords) {  
      return [locationHistory[0].coords.lat, locationHistory[0].coords.lng];  
    }  
    // مرکز پیش‌فرض - تهران  
    return [35.6892, 51.3890];  
  };  
  
  return (  
    <div className="map-fullscreen">  
      <MapContainer   
        center={getInitialCenter()}   
        zoom={initialZoom}   
        className="map-container"  
        whenCreated={setMap}  
        zoomControl={false} // غیرفعال کردن کنترل زوم پیش‌فرض  
      >  
        <ZoomControl position="topright" /> {/* قرار دادن کنترل زوم در موقعیت بالا-راست */}  
        
        <TileLayer  
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'  
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"  
        />  
        
        {/* نمایش موقعیت فعلی کاربر */}  
        {currentLocation?.coords && (  
          <>  
            <Marker   
              position={[currentLocation.coords.lat, currentLocation.coords.lng]}  
              icon={currentLocationIcon}  
            >  
              <Popup>  
                <div>  
                  <h3>موقعیت فعلی شما</h3>  
                  <p>طول جغرافیایی: {currentLocation.coords.lng.toFixed(6)}</p>  
                  <p>عرض جغرافیایی: {currentLocation.coords.lat.toFixed(6)}</p>  
                  <p>دقت: {currentLocation.coords.accuracy.toFixed(2)} متر</p>  
                  {currentLocation.coords.altitude && (  
                    <p>ارتفاع: {currentLocation.coords.altitude.toFixed(2)} متر</p>  
                  )}  
                </div>  
              </Popup>  
            </Marker>  
            
            {/* دایره دقت */}  
            <Circle   
              center={[currentLocation.coords.lat, currentLocation.coords.lng]}  
              radius={currentLocation.coords.accuracy}  
              color="#0085ff"  
              fillColor="#0085ff"  
              fillOpacity={0.1}  
            />  
          </>  
        )}  
        
        {/* مسیر طی شده */}  
        {pathPoints.length > 1 && (  
          <Polyline   
            positions={pathPoints}   
            color="#0085ff"   
            weight={3}   
            opacity={0.7}   
          />  
        )}  
        
        {/* نقاط ذخیره شده */}  
        {savedLocations.map((location, index) => (  
          <Marker   
            key={location.id || index}  
            position={[location.coords.lat, location.coords.lng]}  
          >  
            <Popup>  
              <div>  
                <h3>{location.name || 'مکان ذخیره شده'}</h3>  
                <p>طول جغرافیایی: {location.coords.lng.toFixed(6)}</p>  
                <p>عرض جغرافیایی: {location.coords.lat.toFixed(6)}</p>  
                {location.timestamp && (  
                  <p>زمان: {new Date(location.timestamp).toLocaleString('fa-IR')}</p>  
                )}  
              </div>  
            </Popup>  
          </Marker>  
        ))}  
        
        {/* تنظیم خودکار مرکز نقشه */}  
        <AutoCenterMap position={currentLocation} follow={isFollowing} />  
      </MapContainer>  
      
      {/* دکمه‌های کنترل نقشه */}  
      <div className="map-controls-overlay">  
        {/* دکمه تعقیب موقعیت */}  
        <button   
          className={`map-control-button ${isFollowing ? 'active' : ''}`}  
          onClick={toggleFollow}  
          title={isFollowing ? 'توقف تعقیب موقعیت' : 'تعقیب موقعیت'}  
        >  
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">  
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />  
            <circle cx="12" cy="10" r="3" />  
          </svg>  
        </button>  
        
        {/* دکمه مرکز به موقعیت فعلی */}  
        <button   
          className="map-control-button"  
          onClick={() => {  
            if (currentLocation?.coords && map) {  
              map.setView(  
                [currentLocation.coords.lat, currentLocation.coords.lng],   
                map.getZoom()  
              );  
            }  
          }}  
          title="مرکز به موقعیت فعلی"  
        >  
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">  
            <circle cx="12" cy="12" r="10" />  
            <circle cx="12" cy="12" r="3" />  
          </svg>  
        </button>  
      </div>  
      
      {/* پنل اطلاعات موقعیت */}  
      {currentLocation && (  
        <div className="location-panel">  
          <div className="coordinates-display">  
            <div>  
              <span>عرض:</span> {currentLocation.coords.lat.toFixed(6)}  
            </div>  
            <div>  
              <span>طول:</span> {currentLocation.coords.lng.toFixed(6)}  
            </div>  
            <div>  
              <span>دقت:</span> {currentLocation.coords.accuracy.toFixed(1)}m  
            </div>  
          </div>  
        </div>  
      )}  
    </div>  
  );  
};  

export default MapView;  