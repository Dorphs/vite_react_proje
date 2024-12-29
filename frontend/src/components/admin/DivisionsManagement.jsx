import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Alert,
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';

export default function DivisionsManagement() {
  const [divisions, setDivisions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    departmentId: ''
  });

  useEffect(() => {
    fetchDivisions();
    fetchDepartments();
  }, []);

  const fetchDivisions = async () => {
    try {
      const response = await axios.get('/api/divisions');
      setDivisions(response.data.data);
    } catch (error) {
      setError('Şube müdürlükleri yüklenirken bir hata oluştu');
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      setDepartments(response.data.data);
    } catch (error) {
      console.error('Daire başkanlıkları yüklenirken hata:', error);
    }
  };

  const handleOpenDialog = (division = null) => {
    if (division) {
      setSelectedDivision(division);
      setFormData({
        name: division.name,
        description: division.description || '',
        departmentId: division.departmentId || ''
      });
    } else {
      setSelectedDivision(null);
      setFormData({
        name: '',
        description: '',
        departmentId: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDivision(null);
    setFormData({
      name: '',
      description: '',
      departmentId: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedDivision) {
        await axios.put(`/api/divisions/${selectedDivision.id}`, formData);
      } else {
        await axios.post('/api/divisions', formData);
      }
      fetchDivisions();
      handleCloseDialog();
    } catch (error) {
      setError('Şube müdürlüğü kaydedilirken bir hata oluştu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu şube müdürlüğünü silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`/api/divisions/${id}`);
        fetchDivisions();
      } catch (error) {
        setError('Şube müdürlüğü silinirken bir hata oluştu');
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Şube Müdürlükleri Yönetimi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Yeni Şube Müdürlüğü
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Şube Müdürlüğü</TableCell>
              <TableCell>Daire Başkanlığı</TableCell>
              <TableCell>Açıklama</TableCell>
              <TableCell>Personel Sayısı</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? divisions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : divisions
            ).map((division) => (
              <TableRow key={division.id}>
                <TableCell>{division.name}</TableCell>
                <TableCell>{division.department?.name || '-'}</TableCell>
                <TableCell>{division.description || '-'}</TableCell>
                <TableCell>{division.users?.length || 0}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(division)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(division.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={divisions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Sayfa başına satır:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count}`
          }
        />
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedDivision ? 'Şube Müdürlüğü Düzenle' : 'Yeni Şube Müdürlüğü'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Şube Müdürlüğü Adı"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              select
              label="Daire Başkanlığı"
              name="departmentId"
              value={formData.departmentId}
              onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              required
              sx={{ mb: 2 }}
            >
              <MenuItem value="">
                <em>Seçiniz</em>
              </MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Açıklama"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedDivision ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
