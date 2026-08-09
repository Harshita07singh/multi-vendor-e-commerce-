import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE =
  `${import.meta.env.VITE_API_BASE_URL}/locations` || "/api/locations";

// Helper — attaches token from localStorage to every request
const authConfig = () => {
  const token = localStorage.getItem("accessToken");
  return {
    withCredentials: true,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
};

// ── Thunks ──────────────────────────────────────────────────────────────────

export const fetchLocations = createAsyncThunk(
  "location/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(BASE, authConfig());
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch locations",
      );
    }
  },
);

export const addLocation = createAsyncThunk(
  "location/add",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(BASE, payload, authConfig());
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add location",
      );
    }
  },
);

export const updateLocation = createAsyncThunk(
  "location/update",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`${BASE}/${id}`, payload, authConfig());
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update location",
      );
    }
  },
);

export const deleteLocation = createAsyncThunk(
  "location/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${BASE}/${id}`, authConfig());
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete location",
      );
    }
  },
);

export const setDefaultLocation = createAsyncThunk(
  "location/setDefault",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(
        `${BASE}/${id}/default`,
        {},
        authConfig(),
      );
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to set default",
      );
    }
  },
);

// Get browser location for nearby products (guest or when no saved location)
export const fetchBrowserLocation = createAsyncThunk(
  "location/fetchBrowserLocation",
  (_, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(rejectWithValue("Geolocation not supported"));
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        (err) => reject(rejectWithValue(err.message || "Location denied")),
      );
    });
  },
);

// ── Slice ────────────────────────────────────────────────────────────────────

const locationSlice = createSlice({
  name: "location",
  initialState: {
    locations: [],
    activeLocation: null,
    browserCoords: null,
    error: null,
  },
  reducers: {
    setActiveLocation(state, action) {
      state.activeLocation = action.payload;
    },
    clearLocationError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const rejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      // fetchAll
      .addCase(fetchLocations.pending, pending)
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload;
        state.activeLocation =
          action.payload.find((l) => l.isDefault) || action.payload[0] || null;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.loading = false;
        // Silently ignore 401 — user just isn't logged in yet
        if (
          action.payload !== "Not authorized" &&
          action.payload !== "Relogin"
        ) {
          state.error = action.payload;
        }
      })

      // add
      .addCase(addLocation.pending, pending)
      .addCase(addLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.locations.unshift(action.payload);
        if (action.payload.isDefault) {
          state.locations.forEach((l) => {
            if (l._id !== action.payload._id) l.isDefault = false;
          });
          state.activeLocation = action.payload;
        }
      })
      .addCase(addLocation.rejected, rejected)

      // update
      .addCase(updateLocation.pending, pending)
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.locations.findIndex(
          (l) => l._id === action.payload._id,
        );
        if (idx !== -1) state.locations[idx] = action.payload;
        if (action.payload.isDefault) {
          state.locations.forEach((l) => {
            if (l._id !== action.payload._id) l.isDefault = false;
          });
          state.activeLocation = action.payload;
        }
      })
      .addCase(updateLocation.rejected, rejected)

      // delete
      .addCase(deleteLocation.pending, pending)
      .addCase(deleteLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = state.locations.filter(
          (l) => l._id !== action.payload,
        );
        state.activeLocation =
          state.locations.find((l) => l.isDefault) ||
          state.locations[0] ||
          null;
      })
      .addCase(deleteLocation.rejected, rejected)

      // setDefault
      .addCase(setDefaultLocation.pending, pending)
      .addCase(setDefaultLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.locations.forEach((l) => {
          l.isDefault = l._id === action.payload._id;
        });
        state.activeLocation = action.payload;
      })
      .addCase(setDefaultLocation.rejected, rejected)

      // fetchBrowserLocation
      .addCase(fetchBrowserLocation.fulfilled, (state, action) => {
        state.browserCoords = action.payload;
      })
      .addCase(fetchBrowserLocation.rejected, (state) => {
        state.browserCoords = null;
      });
  },
});

export const { setActiveLocation, clearLocationError } = locationSlice.actions;

// Selector: coords for nearby product filtering (saved address or browser location)
// Returns stable reference - use shallowEqual in useSelector to prevent infinite loops
export const selectCustomerCoords = (state) => {
  const loc = state.location?.activeLocation;
  if (loc?.coordinates?.lat != null && loc?.coordinates?.lng != null) {
    return { lat: loc.coordinates.lat, lng: loc.coordinates.lng };
  }
  return state.location?.browserCoords || null;
};

// Primitive key for useEffect deps - prevents infinite re-fetches
export const selectCustomerCoordsKey = (state) => {
  const coords = selectCustomerCoords(state);
  return coords ? `${coords.lat},${coords.lng}` : null;
};
export default locationSlice.reducer;
