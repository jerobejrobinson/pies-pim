## Auth
- first_name
- last_name
- preferred_name
- password: use signin methods like google
- email
- phone
- user_roles: student | case_manager | community_partner | admin

## Table: students
*Table for students*

### Access
- **Students** can SELECT own row.
- **Case Managers** can SELECT assigned **Student** from case_managers_to_students. 
- **Admins** can SELECT all rows.

### Columns
- id -> user_id
- school_name
- graduation_year
- date_of_birth
- mood

## Table: case_managers
*Table for case managers*

### Access
- **Case managers** can SELECT own row. 
- **Admins** can SELECT all rows.

### Columns
- id -> user_id

## Table: case_managers_to_students
*This table is used to keep track of case manager to student relationships*

### Access
- **Admins** can SELECT, CREATE & DELETE rows.

### Columns
- id
- student_id
- case_manager_id

## Table: community_partners
*Table for community_partners, this was mainly created so that community partners can verify that the student has completed the assigned community service hours.*

### Access
- **Admins** can SELECT all rows.
- **Case Managers** can SELECT all rows.
- **Students** can SELECT all rows.
- **Community Partners** can SELECT & Update own row.

### Columns
- id -> user_id
- organization_name
- organization_contact_name
- orgonization_phone
- organization_address
- organization_address_2
- organization_city
- organization_state
- organization_zip

## Table: community_service_opportunities
*This table will be used by admins or community partners to create community service opportunies. If a community partner submits the opportunity it must be approved by an admin first. Assuming that there is a limit on how many students can sign up for a service. We have created a max slots and slots taken column if slots taken colmun is equal to max slots then the service will no longer be available to preform.*

### Access
- **Admins** can SELECT, CREATE, UPDATE, & DELETE all rows.
- **Community Partners** can SELECT, CREATE, UPDATE, & DELETE own row.
- **Case Managers** can SELECT all rows.
- **Students** can SELECT all rows.

### Columns
- id
- community_partner_id
- service_name
- service_comppleted
- amount_of_hours
- max_slots
- slots_taken

## Table: mood
*Students are able to update their mood on a daily basis. The case manager assigned to student should get email notification of updated mood.*

### Access
- **Admins** can SELECT all rows.
- **Case Managers** can SELECT rows WHERE student equal assigned.
- **Students** can SELECT & UPDATE own rows.

### Columns
- id
- student_id
- mood
- date_added

## Table: gpa
*Students are required to update their GPA on a quarterly/ 9 week basis starting from August to May. May need to create a table that allows admins to added due dates from updating student GPAs*

### Access
- **Admins** can SELECT all rows.
- **Case Managers** can SELECT rows WHERE student equal assigned.
- **Students** can SELECT & UPDATE own rows.

### Columns
- id
- student_id
- gpa
- date_added

## Table: gpa_due_date
*Admins will use this table to add due dates for gpa. Will setup triggers that will notify students/ case managers that GPA updates are due.*

### Access
- **Admins** can SELECT, CREATE, UPDATE, & DELETE all rows.
- **Case Managers** can SELECT all rows.
- **Students** can SELECT all rows.

### Columns
- id
- due_date
- semester
- school_year

## Table: attendance
*Students are required to input any attendance infractions. Students can only add infractions. Case manager may add or delete infractions to students they are assigned to.*

### Access
- **Admins** can SELECT all rows.
- **Case Managers** can SELECT & UPDATE rows WHERE student equal assigned.
- **Students** can SELECT & UPDATE own rows.

### Columns
- id: uuid
- student_id: uuid
- case_manager_id: uuid | null
- date_added: datestampz
- type: absence | tardy | early dismissal

## Table: behavior_log
*Students are required to add changes to mood/behaviors and update situtaions that they have expereniced.*

### Access
- **Admins** can SELECT all rows.
- **Case Managers** can SELECT & UPDATE rows WHERE student equal assigned.
- **Students** can SELECT & UPDATE own rows.

### Columns
- id
- student_id
- date_added
- type: Positive Interaction | Negative Thought | Positive Behavior | Negative Interaction | Negative Thought
- description
- outcome

## Table: goal_log
*Students will be able to create personalized goals for themselves. The should be a reccomendation systems that reccomnend resource to help students achieve desired goal. Resource category may help in determining the resources displayed to students*

### Access
- **Admins** can SELECT all rows.
- **Case Managers** can SELECT rows WHERE student equal assigned.
- **Students** can SELECT & UPDATE own rows.

### Columns
- id
- student_id
- goal
- deadline
- resource_category_id

## Table: resource_category
*Case manager / Admins will be able to update the list of categories that resources can have.*

### Access
- **Admins** can SELECT, CREATE, UPDATE, & DELETE all rows.
- **Case Managers** can SELECT, CREATE, & UPDATE all rows.
- **Students** can SELECT all rows.

### Columns
- id
- category_name

## Table: resources
*Case manager / Admins will be able to update the list of resources students can use to help with their goals.*

### Access
- **Admins** can SELECT, CREATE, UPDATE, & DELETE all rows.
- **Case Managers** can SELECT, CREATE, UPDATE, & DELETE all rows.
- **Students** can SELECT all rows.

### Columns
- resource_category_id
- name
- description
- link

## Table: enrollments
*Students will be able to mark that they have start working through a resource and can mark when they have completed it. Before starting student should write out what they want to get out of it. And once completed students will be able to determine the outcome of it and be able to give the resource a rating*

### Access
- **Admins** can SELECTall rows.
- **Case Managers** can SELECT rows WHERE student equal assigned.
- **Students** can SELECT & UPDATE all rows.

### Columns
- id
- student_id
- resource_id
- date_enrolled
- date_completed
- expection_of_resource
- outcome
- rating: 1 - 5

## Table: student_community_service_hours
*This will be used by students and community partners to mark that the service has been completed. A student can set a date finished, but it will not be counted as done until the community partner signs it off.*

### Access
- **Admins** can SELECT all rows.
- **Community Partners** can SELECT, UPDATE own row.
- **Case Managers** can SELECT rows WHERE student equal assigned.
- **Students** can SELECT own rows.

### Columns
- id
- student_id
- community_partner_id
- hours_completed
- date_started
- date_finished
- signed_off