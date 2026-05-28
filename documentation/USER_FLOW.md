# User Flow

```mermaid
flowchart TD
    User(["User"]) --> Landing

    subgraph LandingState ["Landing State"]
        Landing["App loads\nCanvas animation plays\nButterfly Effect title visible"]
    end

    Landing --> Choice{{"First action?"}}

    Choice -->|"Click View Now"| Observer
    Choice -->|"Start survey"| Role

    subgraph ObserverPath ["Observer Mode"]
        Observer["Skip survey\nOpen shared results without personal response"]
        Observer --> Graph
    end

    subgraph SurveyPath ["Onboarding Survey"]
        Role["Select role\nStudent, staff, or visitor"]
        Role --> Section
        Section["Select section\nStudent / staff departments"]
        Section --> Questions
        Questions["Answer 5 questions\nButton selections drive live canvas feedback"]
        Questions --> Finish["Click Finish"]
    end

    subgraph Submit ["Submit"]
        Finish --> Transform["Compute weights\nq1-q5 averaged from selections"]
        Transform --> Token["Create or reuse browser edit token"]
        Token --> EdgeFn["Supabase Edge Function\nPOST save-user-response"]
        EdgeFn --> Sanity[("Sanity CMS\nuserResponseV4 document created\neditTokenHash stored")]
        EdgeFn --> Session["session/local storage\nentry id, section, role, doc snapshot, raw edit token"]
    end

    Sanity --> Graph

    subgraph GraphView ["Graph View"]
        Graph["Shared visualization opens\n3D dot graph of responses"]
        Graph --> SectionSwitch["Switch section filter\nstudents, staff, all, or department"]
        Graph --> ModeToggle["Toggle view mode\nAbsolute / relative"]
        Graph --> DarkToggle["Toggle dark / light mode"]
        Graph --> Personalized["Personalized entry highlighted\nsubmitted users only"]
        Personalized --> SoloMessage["Optional solo message\npatches only this response when edit token matches"]
    end

    SoloMessage -->|"empty message"| FallbackCopy["Use personalized Sanity copy\nthen local fallback copy"]

    Graph --> Back["Click Back"]
    Back --> Reset["Clear visible app state\nKeep local response ownership"]
    Reset --> Landing
    Reset -->|"Click View Now with saved response"| Graph
```

## Notes

- Observer mode can view shared results but cannot edit a personal response because it has no response id or edit token.
- Submitted users can edit the solo message only while the browser still has the matching raw edit token.
- Clicking Back returns to the landing flow without deleting the saved response keys.
- Refreshing also starts on the landing flow; saved response keys only restore identity when the user opens results again.
- Clicking View Now after Back restores the saved response path, not observer mode.
- Taking the survey again replaces the saved response identity with the newest submitted response.
- Clearing browser storage intentionally removes that edit capability.
