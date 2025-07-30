// A safe wrapper to ensure callback always exists
export const safeCallback = (callback, response) => {
  try {
    if (typeof callback === "function") {
      callback(response)
    } else {
      console.warn("⚠️ No callback provided for socket event", response)
    }
  } catch (err) {
    console.error("🚨 Error executing socket callback:", err)
  }
}
