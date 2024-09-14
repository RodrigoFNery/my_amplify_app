import { useState, useEffect } from "react";
import { View, Button, Text, StyleSheet, FlatList } from "react-native";

import { generateClient } from "aws-amplify/data";
import { V6Client } from "@aws-amplify/api-graphql"
import type { Schema } from "../amplify/data/resource";
import { GraphQLError } from "graphql";
import { Amplify } from "aws-amplify";

const client:V6Client<Schema> = generateClient<Schema>() as V6Client<Schema>;

const TodoList = () => {
  const dateTimeNow = new Date();
  const [todos, setTodos] = useState<Schema["Todo"]["type"][]>([]);
  const [errors, setErrors] = useState<GraphQLError>();

  useEffect(() => {
    console.log('useEffect')
    console.log('client')
    // console.log(JSON.stringify(client.models))
    // console.log('client:'+JSON.stringify(client))
    const sub = client.models.Todo.observeQuery().subscribe({
      next: ({ items }) => {
        console.log('subscribe')
        setTodos([...items]);
      },
    });
    return () => sub.unsubscribe();
  }, []);

  const createTodo = async () => {
    console.log('createTodo')
    try {
      if (client) {
        await client.models.Todo.create({
          content: `${dateTimeNow.getUTCMilliseconds()}`,
        });
      }
    } catch (error: unknown) {
      if (error instanceof GraphQLError) {
        setErrors(error);
      } else {
        throw error;
      }
    }
  };

  if (errors) {
    return <Text>{errors.message}</Text>;
  }

  const renderItem = ({ item }: { item: Schema["Todo"]["type"] }) => (
    <TodoItem {...item} />
  );
  return (
    <View style={{height:"90%", marginTop:10 }}>
      <FlatList
        data={todos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => (
          <View style={styles.listItemSeparator} />
        )}
        style={styles.listContainer}
      ></FlatList>
      {todos.length == 0 && <Text style={{marginTop:0}} >The todo list is empty.</Text>}
      <Button onPress={createTodo} title="Create Todo" />
    </View>
  );
};

const TodoItem = (todo: Schema["Todo"]["type"]) => (
  <View style={styles.todoItemContainer} key={todo.id}>
    <Text
      style={{
        ...styles.todoItemText,
        textDecorationLine: todo.isDone ? "line-through" : "none",
        textDecorationColor: todo.isDone ? "red" : "black",
      }}
    >
      {todo.content}
    </Text>
    <Button
      onPress={async () => {
        if (client) {
          await client.models.Todo.delete(todo);
        }
      }}
      title="Delete"
    />
    <Button
      onPress={() => {
        if (client) {
          client.models.Todo.update({
            id: todo.id,
            isDone: !todo.isDone,
          });
        }
      }}
      title={todo.isDone ? "Undo" : "Done"}
    />
  </View>
);

const styles = StyleSheet.create({
  todoItemContainer: { flexDirection: "row", alignItems: "center", padding: 8 },
  todoItemText: { flex: 1, textAlign: "center" },
  listContainer: { flex: 1, alignSelf: "stretch", padding: 8 },
  listItemSeparator: { backgroundColor: "lightgrey", height: 2 },
});

export default TodoList;