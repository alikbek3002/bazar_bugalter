-- Add receipt_url to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('contracts', 'contracts', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true) ON CONFLICT (id) DO NOTHING;

-- Policies for contracts bucket
CREATE POLICY "Public Access Contracts" ON storage.objects FOR SELECT USING (bucket_id = 'contracts');
CREATE POLICY "Auth Upload Contracts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'contracts' AND auth.role() = 'authenticated');
CREATE POLICY "Owner Delete Contracts" ON storage.objects FOR DELETE USING (bucket_id = 'contracts' AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'owner');

-- Policies for receipts bucket
CREATE POLICY "Public Access Receipts" ON storage.objects FOR SELECT USING (bucket_id = 'receipts');
CREATE POLICY "Auth Upload Receipts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.role() = 'authenticated');
CREATE POLICY "Owner/Accountant Delete Receipts" ON storage.objects FOR DELETE USING (bucket_id = 'receipts' AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('owner', 'accountant'));
