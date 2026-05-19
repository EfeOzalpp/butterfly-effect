# User Flow

```mermaid
flowchart TD
    User(["User"]) --> Landing

    subgraph Landing ["Landing State"]
        Landing["App loads\nCanvas animation plays\n'Butterfly Effect' title visible"]
    end

    Landing --> Choice{{"First action?"}}

    Choice -->|"Click 'View Now'"| Observer
    Choice -->|"Start survey"| Role

    subgraph ObserverPath ["Observer Mode"]
        Observer["Skip survey\nSection defaults to 'fine-arts'"]
        Observer --> Graph
    end

    subgraph SurveyPath ["Onboarding Survey"]
        Role["Select Role\nStudent · Staff · Visitor"]
        Role --> Section
        Section["Select Section\n37 student / 44 staff departments"]
        Section --> Questions
        Questions["Answer 5 Questions\nmulti-select buttons\nlive canvas updates during interaction"]
        Questions --> Finish["Click Finish"]
    end

    subgraph Submit ["Submit"]
        Finish --> Transform["Compute weights\nq1–q5 averaged from selections"]
        Transform --> EdgeFn["Supabase Edge Function\nPOST save-user-response"]
        EdgeFn --> Sanity[("Sanity CMS\nuserResponseV4 document created")]
        EdgeFn --> Session["sessionStorage\nbe.mySection · be.myEntryId\nbe.myRole · be.myDoc"]
    end

    Sanity --> Graph

    subgraph GraphView ["Graph View"]
        Graph["Data Visualization opens\n3D dot graph — all responses"]
        Graph --> SectionSwitch["Switch section filter\nstudents · staff · all · specific dept"]
        Graph --> ModeToggle["Toggle view mode\nAbsolute ↔ Relative"]
        Graph --> DarkToggle["Toggle dark / light mode"]
        Graph --> Personalized["Personalized entry highlighted\n(submitted users only)"]
    end

    Graph --> Back["Click 'Back'"]
    Back --> Reset["Clear all state\nClear sessionStorage"]
    Reset --> Landing
```
