import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kwfbazivsqdfbtjgehjr.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3ZmJheml2c3FkZmJ0amdlaGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3Mzc3OTUsImV4cCI6MjA4NDMxMzc5NX0.eUkrn2mQOysL0AZC-3uTdwA2gZkU_seZOLwdsgnPlzg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
