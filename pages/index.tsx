import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import MuiAppBar from '@material-ui/core/AppBar';
import MuiToolbar from '@material-ui/core/Toolbar';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import axios from 'axios';

type DynamicForm = {
  fieldName: string;
  type: string;
  value: string | number;
  options?: string[];
};

async function getDynamicForm() {
  try {
    const { data } = await axios.get<any>(
      'https://ulventech-react-exam.netlify.app/api/form',
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('error message: ', error.message);
    } else {
      console.log('unexpected error: ', error);
    }
  }
}

const Footer = (props) => {
  return (
      <Container sx={{marginTop: 5}}>
        <Box>
          <Typography>
            {props.text}
          </Typography>
        </Box>
      </Container>
  );
}

async function postDynamicForm(input: any) {
  try {
    const { data } = await axios.post<any>(
      'https://ulventech-react-exam.netlify.app/api/form',
      input,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('error message: ', error.message);
    } else {
      console.log('unexpected error: ', error);
    }
  }
}

const Input = ({ value, onChange, type, options, name }: any): any => {
  switch (type) {
    case 'text':
      return (
        <TextField
          fullWidth
          label={name}
          onChange={(event) => onChange(event.target.value)}
          defaultValue={value}
        />
      );
    case 'number':
      return (
        <TextField
          fullWidth
          label={name}
          onChange={(event) => onChange(event.target.value)}
          defaultValue={value}
        />
      );
    case 'email':
      return (
        <TextField
          fullWidth
          label={name}
          onChange={(event) => onChange(event.target.value)}
          defaultValue={value}
        />
      );
    case 'multiline':
      return (
        <TextField
          fullWidth
          multiline
          label={name}
          onChange={(event) => onChange(event.target.value)}
          defaultValue={value}
        />
      );
    case 'select':
      return (
        <Fragment>
          <Select
            fullWidth
            label={name}
            onChange={(event) => onChange(event.target.value)}
            defaultValue={value}
          >
            {options.map(
              (
                el: string | number | readonly string[] | undefined,
                index: React.Key | null | undefined,
              ) => (
                <MenuItem key={index} value={el}>
                  {el}
                </MenuItem>
              ),
            )}
          </Select>
        </Fragment>
      );
    default:
      return null;
  }
};

export default function Index() {
  const {
    handleSubmit,
    register,
    formState: { errors },
    control,
    reset,
  } = useForm();

  const [data, setData] = useState<DynamicForm[] | undefined>([]);
  const [result, setResult] = useState<string>('');
  const isMounted = useRef(false);

  useEffect(() => {
    getDynamicForm().then((resp) => {
      setData(resp?.data);
    });
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      reset();
      setResult('');
    } else {
      isMounted.current = true;
    }
  }, [data]);

  const onSubmit = (data: any) => {
    postDynamicForm(data).then((resp) => {
      setResult(JSON.stringify(resp.data, null, 1));
    });
  };

  const GenerateInputForm = ({ configs }) => {
    return configs?.map((el: any) => {
      const { value, fieldName, options } = el;
      if (el.type === 'email') {
        return (
          <Controller
            name={fieldName}
            control={control}
            defaultValue={value}
            render={({ field }) => (
              <Grid item xs={12}>
                <Input
                  value={field.value}
                  type={el.type}
                  options={options}
                  {...register('email', {
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Entered value does not match email format',
                    },
                  })}
                  onChange={field.onChange}
                />
                {errors.email && (
                  <span role="alert">{errors.email.message}</span>
                )}
              </Grid>
            )}
          />
        );
      } else {
        return (
          <Controller
            name={fieldName}
            control={control}
            defaultValue={value}
            render={({ field }) => (
              <Grid item xs={12}>
                <Input
                  value={field.value}
                  type={el.type}
                  options={options}
                  {...register(fieldName, {})}
                  onChange={field.onChange}
                />
              </Grid>
            )}
          />
        );
      }
    });
  };

  return renderDynamicForm();

  function renderDynamicForm() {
    return (
      <React.Fragment>
        <Container maxWidth="sm">
          <MuiAppBar elevation={0} position="fixed">
            <MuiToolbar height={64}></MuiToolbar>
          </MuiAppBar>
          <Box sx={{ mt: 3, mb: 12 }}>
            <Paper
              background="light"
              sx={{ py: { xs: 4, md: 8 }, px: { xs: 3, md: 6 } }}
            >
              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container alignItems="flex-start" spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h4" component="h1" gutterBottom>
                      Dynamic Form
                    </Typography>
                  </Grid>
                  <GenerateInputForm configs={data} />
                  <Grid item style={{ marginTop: 4 }}>
                    <Button type="submit" variant="contained">
                      Submit
                    </Button>
                  </Grid>
                </Grid>
              </form>
              <Footer text={result}/>
            </Paper>
          </Box>
        </Container>
      </React.Fragment>
    );
  }
}
