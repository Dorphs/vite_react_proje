import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Avatar,
  Chip,
  Paper,
  useTheme
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccountBalance as DepartmentIcon,
  Group as DivisionIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme, level }) => ({
  marginBottom: theme.spacing(2),
  marginLeft: level > 0 ? theme.spacing(4) : 0,
  borderLeft: `4px solid ${
    level === 0 
      ? theme.palette.primary.main 
      : level === 1 
        ? theme.palette.secondary.main 
        : theme.palette.info.main
  }`,
}));

const Department = ({ department, level = 0 }) => {
  const [expanded, setExpanded] = useState(true);
  const theme = useTheme();

  return (
    <Box>
      <StyledCard level={level}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ListItemIcon>
                {level === 0 ? (
                  <PersonIcon color="primary" />
                ) : level === 1 ? (
                  <DepartmentIcon color="secondary" />
                ) : (
                  <DivisionIcon color="info" />
                )}
              </ListItemIcon>
              <Box>
                <Typography variant="h6" component="div">
                  {department.name}
                </Typography>
                {department.manager && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Avatar
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        mr: 1,
                        bgcolor: theme.palette.primary.main
                      }}
                    >
                      {department.manager.name.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      {department.manager.name} - {department.manager.title}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
            {department.divisions && department.divisions.length > 0 && (
              <IconButton
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
                aria-label="show more"
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
          </Box>
        </CardContent>
      </StyledCard>
      {department.divisions && department.divisions.length > 0 && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List disablePadding>
            {department.divisions.map((division, index) => (
              <Department
                key={index}
                department={division}
                level={level + 1}
              />
            ))}
          </List>
        </Collapse>
      )}
    </Box>
  );
};

export default function OrganizationChart() {
  // Bu veriler API'dan gelecek
  const organizationData = {
    name: 'Genel Müdür',
    manager: {
      name: 'Ahmet Yılmaz',
      title: 'Genel Müdür'
    },
    divisions: [
      {
        name: 'Bilgi Teknolojileri Daire Başkanlığı',
        manager: {
          name: 'Mehmet Demir',
          title: 'Daire Başkanı'
        },
        divisions: [
          {
            name: 'Yazılım Geliştirme Şube Müdürlüğü',
            manager: {
              name: 'Ali Kaya',
              title: 'Şube Müdürü'
            }
          },
          {
            name: 'Sistem ve Network Şube Müdürlüğü',
            manager: {
              name: 'Ayşe Yıldız',
              title: 'Şube Müdürü'
            }
          },
          {
            name: 'Siber Güvenlik Şube Müdürlüğü',
            manager: {
              name: 'Can Öztürk',
              title: 'Şube Müdürü'
            }
          }
        ]
      },
      {
        name: 'İnsan Kaynakları Daire Başkanlığı',
        manager: {
          name: 'Fatma Şahin',
          title: 'Daire Başkanı'
        },
        divisions: [
          {
            name: 'Personel Şube Müdürlüğü',
            manager: {
              name: 'Zeynep Aksoy',
              title: 'Şube Müdürü'
            }
          },
          {
            name: 'Eğitim Şube Müdürlüğü',
            manager: {
              name: 'Mustafa Eren',
              title: 'Şube Müdürü'
            }
          }
        ]
      }
    ]
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Organizasyon Şeması
      </Typography>
      <Paper sx={{ p: 2, mt: 2 }}>
        <Department department={organizationData} />
      </Paper>
    </Box>
  );
}
