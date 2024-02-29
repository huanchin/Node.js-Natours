export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiaHVhbmNoaW4iLCJhIjoiY2x0NDVzZDZiMjI1bDJxbXUycW5tdnJzcCJ9.a0nLTIaNAktAHoWVPgsOLg';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    scrollZoom: false,
    //   center: [30, 15],
    //   zoom: 4,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // 1) create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // 2)A add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // 2)B add popup
    new mapboxgl.Popup({
      offset: 40,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // 3) extends map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
