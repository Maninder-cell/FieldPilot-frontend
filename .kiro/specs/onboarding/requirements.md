# Requirements Document

## Introduction

This document outlines the requirements for implementing a comprehensive onboarding and tenant management system for Field Pilot. The system enables users to create companies/tenants, complete a multi-step onboarding process, manage team members through invitations, and handle tenant-specific operations. The implementation follows a multi-tenant architecture with schema isolation where onboarding operations occur in the public schema (localhost:8000) and tenant-specific operations occur in tenant subdomains.

## Glossary

- **Tenant**: A company or organization that uses the Field Pilot system, with isolated data in a dedicated database schema
- **Public Schema**: The main database schema accessible via localhost:8000, used for authentication and onboarding
- **Tenant Schema**: An isolated database schema for each company, accessible via subdomain (e.g., acme-corporation.localhost:8000)
- **Onboarding Portal**: The public-facing interface at localhost:8000 where users create and configure their companies
- **Trial Period**: A 14-day free trial automatically granted to new companies
- **Member Role**: The permission level assigned to a user within a tenant (owner, admin, manager, member)
- **Invitation**: A time-limited (7-day) request for a user to join a tenant
- **Setup Intent**: A Stripe payment method collection mechanism used before creating subscriptions
- **Onboarding Step**: One of five sequential stages in the company setup process

## Requirements

### Requirement 1: Company Creation

**User Story:** As a new user, I want to create a company account, so that I can start using Field Pilot with my organization

#### Acceptance Criteria

1. WHEN the user submits valid company information including name and email, THE Onboarding_System SHALL create a new tenant with a unique slug and subdomain
2. WHEN a company is created, THE Onboarding_System SHALL automatically add the creating user as the owner with full permissions
3. WHEN a company is created, THE Onboarding_System SHALL activate a 14-day trial period with trial_ends_at timestamp
4. WHEN the user attempts to create a company with a duplicate name, THE Onboarding_System SHALL return a validation error with status code 400
5. WHEN the user accesses the company creation endpoint from a tenant subdomain, THE Onboarding_System SHALL return a 403 Forbidden error with a message directing them to localhost:8000

### Requirement 2: Company Information Management

**User Story:** As a company owner or admin, I want to view and update my company information, so that I can keep our organization details current

#### Acceptance Criteria

1. WHEN an authenticated user requests their current tenant information, THE Onboarding_System SHALL return the complete tenant data including trial status and member count
2. WHEN a user with owner or admin role submits updated company information, THE Onboarding_System SHALL validate and save the changes
3. WHEN a user without owner or admin role attempts to update company information, THE Onboarding_System SHALL return a 403 Forbidden error
4. WHEN a user requests tenant information but has no associated company, THE Onboarding_System SHALL return a success response with null data
5. WHEN the user accesses tenant endpoints from a tenant subdomain, THE Onboarding_System SHALL return a 403 Forbidden error

### Requirement 3: Multi-Step Onboarding Process

**User Story:** As a new company owner, I want to complete a guided onboarding process, so that I can properly set up my organization step by step

#### Acceptance Criteria

1. WHEN the user completes an onboarding step, THE Onboarding_System SHALL increment the onboarding_step counter and save any provided step data
2. WHEN the user completes step 5, THE Onboarding_System SHALL set onboarding_completed to true
3. WHEN the user submits an invalid step number (less than 1 or greater than 5), THE Onboarding_System SHALL return a 400 Bad Request error
4. WHEN the user completes step 2, THE Onboarding_System SHALL store the selected plan information in the step data
5. WHEN the user accesses the onboarding step endpoint from a tenant subdomain, THE Onboarding_System SHALL return a 403 Forbidden error

### Requirement 4: Team Member Management

**User Story:** As a company owner or admin, I want to view all team members in my organization, so that I can see who has access to our system

#### Acceptance Criteria

1. WHEN an authenticated user requests the member list, THE Onboarding_System SHALL return all active members with their user details and roles
2. WHEN the member list is retrieved, THE Onboarding_System SHALL include complete user information including email, name, role, department, and join date
3. WHEN a user requests members but has no associated company, THE Onboarding_System SHALL return a 404 Not Found error
4. WHEN the user accesses the members endpoint from a tenant subdomain, THE Onboarding_System SHALL return a 403 Forbidden error

### Requirement 5: Team Member Invitation

**User Story:** As a company owner or admin, I want to invite new team members by email, so that I can build my organization's team

#### Acceptance Criteria

1. WHEN a user with owner or admin role invites an existing user by email, THE Onboarding_System SHALL add that user to the tenant immediately with the specified role
2. WHEN a user with owner or admin role invites a non-existent user by email, THE Onboarding_System SHALL create an invitation record with a 7-day expiration
3. WHEN a user without owner or admin role attempts to invite members, THE Onboarding_System SHALL return a 403 Forbidden error
4. WHEN an invitation is sent to an email that already has a pending invitation, THE Onboarding_System SHALL return a 400 Bad Request error
5. WHEN an invitation is sent to a user who is already a member, THE Onboarding_System SHALL return a 400 Bad Request error

### Requirement 6: Invitation Management

**User Story:** As a company owner or admin, I want to view all pending invitations, so that I can track who has been invited but not yet joined

#### Acceptance Criteria

1. WHEN a user with owner or admin role requests pending invitations, THE Onboarding_System SHALL return all non-expired invitations with invitee email, role, and expiration date
2. WHEN a user without owner or admin role attempts to view invitations, THE Onboarding_System SHALL return a 403 Forbidden error
3. WHEN pending invitations are retrieved, THE Onboarding_System SHALL exclude invitations that have expired beyond 7 days
4. WHEN the user accesses the invitations endpoint from a tenant subdomain, THE Onboarding_System SHALL return a 403 Forbidden error

### Requirement 7: Invitation Acceptance

**User Story:** As an invited user, I want to check and accept invitations to join companies, so that I can access organizations that have invited me

#### Acceptance Criteria

1. WHEN an authenticated user checks for invitations, THE Onboarding_System SHALL return all pending invitations matching their email address
2. WHEN a user accepts a valid invitation, THE Onboarding_System SHALL add them to the tenant with the specified role
3. WHEN a user attempts to accept an expired invitation, THE Onboarding_System SHALL return a 400 Bad Request error
4. WHEN a user attempts to accept an invitation for a company they are already a member of, THE Onboarding_System SHALL return a 400 Bad Request error
5. WHEN a user attempts to accept a non-existent invitation, THE Onboarding_System SHALL return a 404 Not Found error

### Requirement 8: Schema Access Control

**User Story:** As a system administrator, I want to enforce schema-based access control, so that onboarding operations are isolated from tenant operations

#### Acceptance Criteria

1. WHEN a user accesses any onboarding endpoint from a tenant subdomain, THE Onboarding_System SHALL return a 403 Forbidden error with a redirect message to localhost:8000
2. WHEN a user accesses onboarding endpoints from localhost:8000, THE Onboarding_System SHALL process the request normally
3. WHEN schema validation fails, THE Onboarding_System SHALL include the correct access URL in the error message

### Requirement 9: Trial Period Management

**User Story:** As a new company owner, I want to receive an automatic trial period, so that I can evaluate the system before committing to a subscription

#### Acceptance Criteria

1. WHEN a company is created, THE Onboarding_System SHALL set trial_ends_at to 14 days from creation date
2. WHEN tenant information is retrieved, THE Onboarding_System SHALL include is_trial_active status based on current date comparison with trial_ends_at
3. WHEN the trial period expires, THE Onboarding_System SHALL set is_trial_active to false

### Requirement 10: Role-Based Access Control

**User Story:** As a company owner, I want different permission levels for team members, so that I can control who can perform administrative actions

#### Acceptance Criteria

1. WHEN a user with owner role performs any action, THE Onboarding_System SHALL allow full access including billing and company deletion
2. WHEN a user with admin role attempts to manage members or settings, THE Onboarding_System SHALL allow the action
3. WHEN a user with manager or member role attempts owner/admin-only actions, THE Onboarding_System SHALL return a 403 Forbidden error
4. WHEN role validation occurs, THE Onboarding_System SHALL check the user's role in the TenantMember relationship

### Requirement 11: Error Handling and Validation

**User Story:** As a user, I want clear error messages when something goes wrong, so that I can understand and fix issues

#### Acceptance Criteria

1. WHEN validation fails on any endpoint, THE Onboarding_System SHALL return a 400 Bad Request with field-specific error details
2. WHEN authentication is missing or invalid, THE Onboarding_System SHALL return a 401 Unauthorized error
3. WHEN a resource is not found, THE Onboarding_System SHALL return a 404 Not Found error with a descriptive message
4. WHEN a server error occurs, THE Onboarding_System SHALL return a 500 Internal Server Error with a user-friendly message
5. WHEN any error occurs, THE Onboarding_System SHALL follow the standard error response format with success, message, and optional details fields

### Requirement 12: Data Persistence and Integrity

**User Story:** As a system administrator, I want all onboarding data to be properly persisted and validated, so that data integrity is maintained

#### Acceptance Criteria

1. WHEN a company is created, THE Onboarding_System SHALL generate a unique UUID for the tenant ID
2. WHEN a company slug is generated, THE Onboarding_System SHALL ensure uniqueness and use kebab-case format
3. WHEN member relationships are created, THE Onboarding_System SHALL maintain referential integrity between users and tenants
4. WHEN invitations are created, THE Onboarding_System SHALL store the inviting user reference and expiration timestamp
5. WHEN any data is updated, THE Onboarding_System SHALL update the updated_at timestamp

### Requirement 13: Onboarding Flow Integration

**User Story:** As a new user, I want a seamless flow from registration through company setup to full system access, so that I can quickly start using the platform

#### Acceptance Criteria

1. WHEN a user completes registration, THE Onboarding_System SHALL allow immediate company creation
2. WHEN a user completes step 1 (company info), THE Onboarding_System SHALL enable access to step 2 (plan selection)
3. WHEN a user completes step 3 (payment setup), THE Onboarding_System SHALL enable access to step 4 (team invitations)
4. WHEN a user completes step 5, THE Onboarding_System SHALL grant full access to the tenant subdomain
5. WHEN onboarding is incomplete, THE Onboarding_System SHALL track the current step number for resumption

### Requirement 14: Subdomain and Access URL Generation

**User Story:** As a company owner, I want my company to have a unique subdomain, so that my team can access our isolated workspace

#### Acceptance Criteria

1. WHEN a company is created, THE Onboarding_System SHALL generate a subdomain based on the company slug
2. WHEN tenant information is retrieved, THE Onboarding_System SHALL include the domain and access_url fields
3. WHEN the subdomain is generated, THE Onboarding_System SHALL use the format {slug}.localhost for development environment
4. WHEN the access URL is generated, THE Onboarding_System SHALL include the protocol and port (http://{slug}.localhost:8000)

### Requirement 15: Member Count Tracking

**User Story:** As a company owner, I want to see how many team members are in my organization, so that I can track team growth

#### Acceptance Criteria

1. WHEN tenant information is retrieved, THE Onboarding_System SHALL include an accurate member_count field
2. WHEN a new member is added, THE Onboarding_System SHALL increment the member count
3. WHEN a member is removed or deactivated, THE Onboarding_System SHALL decrement the member count
4. WHEN the member count is calculated, THE Onboarding_System SHALL only include active members
