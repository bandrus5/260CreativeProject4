# Node server for the todo list app

In a previous activity we created a todo list with Vue. In this lab, we'll add a Node server with a
REST API.  This will allow the list to be saved even if the user refreshes their browser. We won't
yet have a database, however, so once you quit Node the list will be lost. We'll fix that another
time.

I've given you code for the todo list app in the `public` directory. There are a few style
changes from the previous code, but it is otherwise identical. We'll be modifying this to
call the server.

## Starting the lab

To start the lab, you must follow this [GitHub Classroom
link](https://classroom.github.com/a/8RMunhwX). This will create a private repository for you using
our classroom site. We will only grade repositories created and submitted this way.

Once you "Accept the assignment" on GitHub Classroom, it will create a new repository for you and
grant you access to it on GitHub. In order to start working on the lab, simply clone the repository
to your laptop or other working environment.

## Tutorial

Use the [tutorial](https://github.com/BYU-CS260-Winter-2018/lab4/wiki)
in the Wiki to create the Node server. This will help you create most
of the functionality.

## Additional Functionality

Once you complete the tutorial, add the following functionality:

1. Add a priority for each task, with 3 priority levels possible. The
user should be able to set the priority when adding the task. Show the
task priority in the list with the task. Be sure the priority is saved
on the server.

1. Add the ability to edit the priority. You can do this however you
like. One possibility is to put a down arrow and an up arrow next to
each task, letting the user decrease or increase the priority by
clicking the arrows. Be sure the new priority is saved on the server.

1. Add a button that sorts the tasks by priority.

## Link to GitHub repository

In a footer, you must include a link to your GitHub repository, which must be
stored in GitHub Classroom.

## Submission

On Canvas, submit the URL for your website, which should be running on
your DigitalOcean server.

## Rubric for Grading

When we grade these labs, we will award points using the following
rubric:

Item                                  | Points
------------------------------------- | ---------
The material in the tutorial          | 70
Adding a task with a priority         | 10
Editing the priority of a task        | 10
Sorting the tasks by priority         | 10

