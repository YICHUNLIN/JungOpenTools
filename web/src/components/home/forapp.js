import * as React from 'react';
import Box from '@mui/material/Box';
import {
    Card, CardHeader, CardContent, CardActions,
    Collapse, Avatar, IconButton,
    Link} from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';


export default ({name, desc, to}) => {
  return (
    <Card sx={{ maxWidth: 400 }}>
      <CardContent>
        <CardHeader
          title={name}
          subheader={desc}
        />
        {/* <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>{desc}</Typography> */}
      </CardContent>
      <CardActions>
        <Button  href={to} >Go</Button>
      </CardActions>
    </Card>
  );
}