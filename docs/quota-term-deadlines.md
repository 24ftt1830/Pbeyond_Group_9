# Company quota term window

Company HR can create quota requests for the next two configured terms. During a
term's opening month, that current term is also available. Company labels use
the start month and year (for example, `January 2025`). Admin retains intake labels.

The deadline is the last calendar day of the configured semester start month,
inclusive, in **Asia/Brunei**. HR sees `Deadline: 31 Jan 2025` and
`Pending requests expire after this date.` for that current term. Admin sees
the deadline in Pending reviews and the company quota details.

After the deadline, only pending requests are automatically rejected. Approved
quotas keep their approval. Each expired request keeps its rejection timestamp
and reason, which HR can view on the quota record. The in-app notification
menu and header bell have been removed.

Expired requests stay in history and cannot be approved or edited by HR. HR must
create a new request for an available term. Existing historical terms remain
attached to saved quotas; restricting new requests does not delete them.

## Automatic processing

`quotas:expire` runs daily at midnight in Brunei through Laravel's scheduler.
Configure the application's normal scheduler on the server. During local
development, `php artisan schedule:work` can keep the scheduler running.

There is also a catch-up check on authenticated Admin and Company requests.
This processes overdue requests before displaying the page or handling approval,
even when the local scheduler was not running. Approval routes independently
reject late approvals, including requests sent from a stale browser page.

The expiry operation is transactional and repeatable: each pending quota is
locked before changing its status, so repeated scheduler/page requests do not
repeat a completed status change. Quotas without an assigned semester
are left for Admin to correct.
