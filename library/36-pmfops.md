# PMFOps

DevOps gave us a pipeline for code. MLOps gave us a pipeline for data modelling. Neither accounts for the thing that fails first in a product: the audience. Foundation models change this, because for the first time we have the raw material to encode audience behaviour as a queryable, testable artefact.

DevOps operationalised the synthetic environment: code runs somewhere reproducible and controllable, versioned, monitored, and owned. MLOps extended the same logic to models and data: both artefacts drift, both require pipelines and a failure mode taxonomy. What is emerging now is a third layer.

## The roles

Four roles structure this layer.

The **AI engineer** builds and maintains the model integrations, the inference infrastructure, and the pipelines that connect data to output. The opacity of the underlying systems means debugging looks more like auditing than tracing.

The **user engineer** builds and maintains the synthetic audience: the structured representation of user behaviour, expectation, and context against which the product is tested. The role sits closer to research methodology than to software engineering, though the tooling overlaps. Think of it as writing tests for human behaviour, in the same way a software engineer writes tests for code. The practice exists informally already: engineers in most product teams spend time reading logs, session data, and behavioural analytics to inform prioritisation decisions. It is untooled, undocumented, and rarely assigned to anyone explicitly, which means it happens inconsistently and disappears when the engineer moves on. The user engineer role is in part a formalisation of that practice, with the synthetic audience as its persistent artefact.

The **eval engineer** designs, monitors, and develops the pipelines which build and maintain the evaluation system. This person owns the question of whether the evals are testing the right things, which is an epistemological responsibility wearing an engineering hat.

The **product manager** in this model is specifically the person who develops hypotheses and tests them against the synthetic audience. The PM no longer mediates between user research and engineering on instinct and judgement. They run structured experiments against an encoded model of the audience. The audience becomes a distribution you can query rather than a constituency you have to go and find.

Both hypothesis generation and synthetic audience construction are high-impact activities with no clear owner of failure. When a hypothesis is wrong, was the PM's framing at fault, or was the synthetic audience insufficiently representative? That question currently has no clean organisational answer, but it is the root tension of product-market-fit.

## The synthetic audience as artefact

The synthetic audience is a data artefact: a queryable representation of the users the product is intended to serve, encoded well enough to support hypothesis testing without requiring access to real users at every iteration. It is not a persona document nor a segment definition. Rather than hand-crafting individual test cases, you define a distribution of user attributes and test against samples from it.

This gives you two loops.

The fast loop runs against the synthetic audience: does the current output distribution match expectation? This should be automated and run continuously, surfacing deviations quickly. The slow loop asks a harder question: is the synthetic audience itself still a valid representation of the real audience? It runs on a longer cycle because changes to the eval system risk invalidating prior results. You cannot simply update the test harness and re-run: you have to audit what the change means for everything measured before.

This asymmetry is where eval rot lives. Eval rot is what happens when the slow loop is neglected: the fast loop keeps passing, the product keeps shipping, and the synthetic audience has gradually stopped representing anything real. It is the product equivalent of code rot, with the same characteristic: invisible until the divergence is large enough to produce an unmistakeable failure, by which point the debt is significant.

## PMFOps

DevOps took a decade to become standard practice. MLOps is still maturing. PMFOps does not yet have a tooling ecosystem, a job title that hiring managers recognise, or a conference circuit. What it has is a clear operational gap and a set of failure modes that organisations are already experiencing without a name for them.

The roles described above are not yet standard. Most teams are staffing with a conventional engineering team and a PM, and discovering that the failure modes do not map onto anything in their existing process. (If you are building something that looks like this, or have watched it fail to, the comments are a reasonable place to work it out.)
