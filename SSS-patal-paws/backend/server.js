require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { supabase } = require("./supabase");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

app.disable("x-powered-by");
app.use(cors({ origin: FRONTEND_ORIGIN === "*" ? true : FRONTEND_ORIGIN.split(",").map((item) => item.trim()) }));
app.use(express.json({ limit: "100kb" }));

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}
function requireAdmin(req, res, next) {
  if (!ADMIN_API_KEY || !req.get("x-admin-key") || req.get("x-admin-key") !== ADMIN_API_KEY) {
    return res.status(401).json({ error: "Admin access required. Check the ADMIN_API_KEY configured on the backend." });
  }
  next();
}
function getErrorMessage(error) {
  return process.env.NODE_ENV === "production" ? "Something went wrong. Please try again." : (error.message || "Unexpected server error.");
}

app.get("/api/health", (req, res) => res.json({ ok: true, service: "Mimme's Patal Paws API" }));

app.get("/api/pets", asyncRoute(async (req, res) => {
  let query = supabase.from("pets").select("*").order("created_at", { ascending: false });
  if (req.query.species) query = query.eq("species", String(req.query.species).toLowerCase());
  if (req.query.status) query = query.eq("status", String(req.query.status).toLowerCase());
  if (req.query.search) query = query.ilike("name", `%${String(req.query.search).replace(/[%_]/g, "")}%`);
  const { data, error } = await query;
  if (error) throw error;
  res.json({ pets: data });
}));

app.get("/api/pets/:id", asyncRoute(async (req, res) => {
  const { data, error } = await supabase.from("pets").select("*").eq("id", req.params.id).maybeSingle();
  if (error) throw error;
  if (!data) return res.status(404).json({ error: "Pet not found." });
  res.json({ pet: data });
}));

app.post("/api/adoption-requests", asyncRoute(async (req, res) => {
  const { pet_id, applicant_name, email, phone, reason } = req.body || {};
  if (!pet_id || !applicant_name || !email || !phone || !reason) {
    return res.status(400).json({ error: "Pet, name, email, phone and reason are all required." });
  }
  const name = String(applicant_name).trim();
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedPhone = String(phone).trim();
  const normalizedReason = String(reason).trim();
  if (name.length < 2 || name.length > 100) return res.status(400).json({ error: "Name must be between 2 and 100 characters." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) return res.status(400).json({ error: "Enter a valid email address." });
  if (!/^[0-9+() -]{7,20}$/.test(normalizedPhone)) return res.status(400).json({ error: "Enter a valid phone number." });
  if (normalizedReason.length < 10 || normalizedReason.length > 1000) return res.status(400).json({ error: "Reason must be between 10 and 1000 characters." });

  const { data: pet, error: petError } = await supabase.from("pets").select("id,status").eq("id", pet_id).maybeSingle();
  if (petError) throw petError;
  if (!pet) return res.status(404).json({ error: "This pet could not be found." });
  if (pet.status !== "available") return res.status(409).json({ error: "This pet is not currently available for adoption." });

  const { data, error } = await supabase.from("adoption_requests").insert({
    pet_id, applicant_name: name, email: normalizedEmail, phone: normalizedPhone, reason: normalizedReason
  }).select("id,pet_id,applicant_name,email,phone,reason,status,created_at").single();
  if (error) throw error;
  res.status(201).json({ message: "Adoption request submitted.", request: data });
}));

app.get("/api/adoption-requests", requireAdmin, asyncRoute(async (req, res) => {
  const { data, error } = await supabase.from("adoption_requests")
    .select("id,pet_id,applicant_name,email,phone,reason,status,created_at,pets(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const requests = (data || []).map(({ pets, ...item }) => ({ ...item, pet_name: pets?.name || null }));
  res.json({ requests });
}));

app.patch("/api/adoption-requests/:id", requireAdmin, asyncRoute(async (req, res) => {
  const allowed = ["pending", "approved", "rejected"];
  const status = String((req.body || {}).status || "").toLowerCase();
  if (!allowed.includes(status)) return res.status(400).json({ error: "Status must be pending, approved or rejected." });
  const { data, error } = await supabase.from("adoption_requests").update({ status })
    .eq("id", req.params.id).select("id,status").maybeSingle();
  if (error) throw error;
  if (!data) return res.status(404).json({ error: "Adoption request not found." });
  res.json({ message: "Request updated.", request: data });
}));

app.delete("/api/adoption-requests/:id", requireAdmin, asyncRoute(async (req, res) => {
  const { data, error } = await supabase.from("adoption_requests").delete()
    .eq("id", req.params.id).select("id").maybeSingle();
  if (error) throw error;
  if (!data) return res.status(404).json({ error: "Adoption request not found." });
  res.json({ message: "Request deleted." });
}));

app.use((req, res) => res.status(404).json({ error: "API route not found." }));
app.use((error, req, res, next) => {
  console.error("API error:", error.message || error);
  res.status(500).json({ error: getErrorMessage(error) });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Mimme's Patal Paws API running at http://localhost:${PORT}`));
}
module.exports = app;
