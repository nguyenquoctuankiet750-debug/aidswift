// pages/api/profile-role.js
// API endpoint for handling profile roles

import { supabase } from '../../utils/supabaseClient';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('user_profiles').select('id, role');
      if (error) throw error;
      res.status(200).json(data);
    } else if (req.method === 'POST') {
      const { id, role } = req.body;
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ role })
        .eq('id', id);
      if (error) throw error;
      res.status(200).json({ message: 'Cập nhật vai trò thành công', data });
    } else {
      res.status(405).json({ error: 'Phương thức không được hỗ trợ' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
