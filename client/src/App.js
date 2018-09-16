import React, { Component } from 'react';
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Form from './Form';

// 1 définir la query
const TodosQuery = gql`
{
  todos {
    id
    text
    complete
  }
}`;
const CreateTodoMutation = gql`
  mutation($text: String!) {
    createTodo(text: $text) {
      id
      text
      complete
    }
  }
`;
const UpdateMutation = gql`
  mutation($id: ID!, $complete: Boolean!) {
    updateTodo(id: $id, complete: $complete)
  }
`;
const RemoveMutation = gql`
  mutation($id: ID!) {
    removeTodo(id: $id)
  }
`;

class App extends Component {

// 4 CODER la query et updater le store en màj data.todos

  createTodo = async text => {
    await this.props.createTodo({
      variables: {
        text
      },
      update: (store, { data: {createTodo} }) => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: TodosQuery });
        // Update / Remove item from the mutation to the end.
        data.todos.unshift(createTodo);
        // Write our data back to the cache.
        store.writeQuery({ query: TodosQuery, data });
      }
    });
  };

  updateTodo = async todo => {
    await this.props.updateTodo({
      variables: {
        id: todo.id,
        complete: !todo.complete
      },
      update: store => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: TodosQuery });
        // Update / Remove item from the mutation to the end.
        data.todos = data.todos.map(
          x =>
            x.id === todo.id
            ? {
                ...todo,
                complete: !todo.complete
              }
          : x
        );
        // Write our data back to the cache.
        store.writeQuery({ query: TodosQuery, data });
      }
    });
  };

  removeTodo = async todo => {
    await this.props.removeTodo({
      variables: {
        id: todo.id
      },
      update: store => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: TodosQuery });
        // Update / Remove item from the mutation to the end.
        data.todos = data.todos.filter(x => x.id !== todo.id);
        // Write our data back to the cache.
        store.writeQuery({ query: TodosQuery, data });
      }
    });
  };

  render() {
    const {data: {loading, todos}} = this.props;
    if (loading) {
      return null;
    }
    console.log(this.props);
    return (
      <div style={{display: 'flex'}}>
        <div style={{margin: 'auto', width: '700'}}>
          <Paper elevation={1}>
            // 3 definir l'evenement associé à la query
            <Form submit={this.createTodo} />
            <List>
              {todos.map(todo => (
                <ListItem
                key={todo.id}
                role={undefined}
                dense
                button
                onClick={() => (this.updateTodo(todo))}
                >
                  <Checkbox
                  checked={todo.complete}
                  tabIndex={-1}
                  disableRipple
                  />
                  <ListItemText primary={todo.text} />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => this.removeTodo(todo)}>
                      <CloseIcon/>
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </div>
      </div>
    );
  }
}

// 2 exporter la query et lui associer un nom
export default compose(
  graphql(CreateTodoMutation, {name: 'createTodo'}),
  graphql(UpdateMutation, {name: 'updateTodo'}),
  graphql(RemoveMutation, {name: 'removeTodo'}),
  graphql(TodosQuery))(App);