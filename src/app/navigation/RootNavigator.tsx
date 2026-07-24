import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {AddTaskScreen} from '../../features/tasks/screens/AddTaskScreen';
import {TaskListScreen} from '../../features/tasks/screens/TaskListScreen';
import type {RootStackParamList} from '../../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen component={TaskListScreen} name="TaskList" />
      <Stack.Screen
        component={AddTaskScreen}
        name="AddTask"
        options={{animation: 'slide_from_right'}}
      />
    </Stack.Navigator>
  );
}
