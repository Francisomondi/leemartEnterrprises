/*
 * ============================================================
 * DELIVERY LOCATIONS
 * ============================================================
 *
 * SERVER SOURCE OF TRUTH.
 *
 * Never trust delivery fees sent from the frontend.
 */

export const DELIVERY_LOCATIONS = [
  { name: "pick up by self", fee: 0 },

  { name: "Nairobi", fee: 300 },
  { name: "Roysambu", fee: 300 },
  { name: "Westlands", fee: 300 },
  { name: "Kasarani", fee: 300 },
  { name: "Thika Road", fee: 300 },
  { name: "Syokimau", fee: 300 },
  { name: "Kitengela", fee: 300 },
  { name: "Kilimani", fee: 300 },
  { name: "Embakasi", fee: 300 },
  { name: "Umoja", fee: 300 },
  { name: "Utawala", fee: 300 },
  { name: "Ruai", fee: 300 },

  { name: "Ruiru", fee: 350 },
  { name: "Juja", fee: 350 },

  { name: "Kahawa", fee: 300 },
  { name: "Gikambura", fee: 300 },
  { name: "Githurai", fee: 300 },
  { name: "Zambezi", fee: 300 },
  { name: "Komarock", fee: 300 },
  { name: "Korogocho", fee: 300 },
  { name: "Dandora", fee: 300 },
  { name: "Kawangware", fee: 300 },
  { name: "Mwiki", fee: 300 },
  { name: "Githogoro", fee: 300 },
  { name: "Karen", fee: 300 },
  { name: "Langata", fee: 300 },
  { name: "Lavington", fee: 300 },
  { name: "Muthaiga", fee: 300 },
  { name: "Parklands", fee: 300 },
  { name: "Pumwani", fee: 300 },
  { name: "Runda", fee: 300 },
  { name: "South B", fee: 300 },
  { name: "South C", fee: 300 },

  { name: "Kiambu", fee: 350 },

  { name: "Mombasa", fee: 500 },
  { name: "Kisumu", fee: 500 },
  { name: "Nakuru", fee: 500 },
  { name: "Eldoret", fee: 500 },
];

/*
 * ============================================================
 * NORMALIZE LOCATION
 * ============================================================
 */

export const normalizeDeliveryLocation = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

/*
 * ============================================================
 * FIND DELIVERY LOCATION
 * ============================================================
 */

export const getDeliveryLocation = (name) => {
  const normalized =
    normalizeDeliveryLocation(name);

  return (
    DELIVERY_LOCATIONS.find(
      (location) =>
        normalizeDeliveryLocation(
          location.name
        ) === normalized
    ) || null
  );
};