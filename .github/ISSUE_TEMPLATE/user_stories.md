---
name: User Stories
about: Use this template for user stories submission
title: "C3 Phase 1: User Stories"
labels: []
assignees: ""
---

## Frontend Selection
In two to three sentences, give a description on the frontend you are to build. Is it going to be a Web frontend? A Discord bot? What external packages, libraries, or frameworks would you need?

Do this **before** you go on to writing your user stores!

- It is going to be a web frontend. We will use React.

## User Stories + DoDs
Make sure to follow the *Role, Goal, Benefit* framework for the user stories and the *Given/When/Then* framework for the Definitions of Done! For the DoDs, think about both success and failure scenarios. You can also refer to the examples DoDs in [C3 spec](https://sites.google.com/view/ubc-cpsc310-22w2/project/checkpoint-3).

### User Story 1

As a user, I want to be able to see all the historic average of a course so that I can decide what courses to take to improve my GPA.

#### Definitions of Done(s)

Scenario 1: Valid department and id \
Given: The user is on the Find Average page. \
When: The user enters a valid department name and an id that the department offers, then clicks button or presses enter key \
Then: The application displays list of average scores of a course that user wants to find. The list will contatin year and average score. If the department offered multiple sections in a certain year, calculate the average of the average scores of the course. The list will be sorted by decreasing order of year.

Scenario 2: Invalid department or id \
Given: The user is on the Find Average page. \
When: The user enters an invalid department name or an id that the department does not offer, then clicks button or presses enter key \
Then: If the user enters an invalid department name or the requested id is not offered in that department, the application displays an error message telling that the user entered invalid course.

### User Story 2

As a user, I want to be able to find an address of a building so that I don't get lost.

#### Definitions of Done(s)

Scenario 1: Valid building name \
Given: The user is on the Find Address page. \
When: The user enters a valid full building name or a valid short building name. \
Then: The application displays the adress of a requested building name.

Scenario 2: Invalid building name \
Given: The user is on the Find Address page. \
When: The user enters a invalid building name. \
Then: The application displays an error message telling that the user entered invalid building name.
