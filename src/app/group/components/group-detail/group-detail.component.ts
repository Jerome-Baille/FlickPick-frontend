import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { DataService } from 'src/app/services/data.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { CreateGroupModalComponent } from 'src/app/shared/components/create-group-modal/create-group-modal.component';

@Component({
  selector: 'app-group-detail',
  templateUrl: './group-detail.component.html',
  styleUrls: ['./group-detail.component.sass']
})
export class GroupDetailComponent {
  isEditing: boolean = false;
  editedGroupName: string = '';

  groupData: any = {};
  groupMembers: any[] = [];
  groupList: any[] = [];
  groupMedia: any[] = [];


  faCirclePlus = faCirclePlus;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private snackbarService: SnackbarService,
    public dialog: MatDialog
  ) {
    this.route.params.subscribe(params => {
      const groupId = params['groupId'];

      this.dataService.getGroupById(groupId).subscribe({
        next: (response: any) => {
          this.groupData = response.group;
          this.groupMembers = response.group.Users;
          this.groupList = response.group.Lists;
          this.groupMedia = response.MediaItems;

          if (response.group.isAdmin && response.group.isAdmin === true) {
            this.groupMedia = this.groupMedia.map(media => {
              return { ...media, isAdmin: true };
            });
          }
        },
        error: (err) => {
          this.snackbarService.showError(err);
        }
      })
    });
  }

  enterEditMode(): void {
    this.isEditing = true;
    this.editedGroupName = this.groupData.name;
  }

  updateGroupName(newGroupName: string): void {
    this.groupData.name = newGroupName;
    this.isEditing = false;

    const updatedGroup = {
      name: this.groupData.name
    }
    this.dataService.updateGroup(this.groupData.id, updatedGroup).subscribe({
      next: (response: any) => {
        this.snackbarService.showSuccess(response.message);
      },
      error: (err) => {
        this.snackbarService.showError(err);
      }
    });
  }

  addMember() {
    const dialogRef = this.dialog.open(CreateGroupModalComponent, {
      data: {
        formType: 'userIds'
      }
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updatedGroup = {
          userIds: this.groupMembers.map((m: any) => m.id).concat(result.users.map((u: any) => u.id))
        }

        this.dataService.updateGroup(this.groupData.id, updatedGroup).subscribe({
          next: (response: any) => {
            this.snackbarService.showSuccess(response.message);
            this.groupMembers = result.users;
          },
          error: (err) => {
            this.snackbarService.showError(err);
          }
        });
      }
    })
  }

  deleteMember(member: any) {
    if (this.groupMembers.length > 2) {
      const updatedGroup = {
        userIds: this.groupMembers.filter((m: any) => m.id !== member.id).map((m: any) => m.id)
      }
      this.dataService.updateGroup(this.groupData.id, updatedGroup).subscribe({
        next: (response: any) => {
          this.snackbarService.showSuccess(response.message);
          this.groupMembers = this.groupMembers.filter((m: any) => m.id !== member.id);
        },
        error: (err) => {
          this.snackbarService.showError(err);
        }
      });
    } else {
      window.alert('You need at least 2 members in a group.');
    }
  }

  updateGroupList(event: any) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(CreateGroupModalComponent, {
      data: {
        formType: 'listName'
      }
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updatedGroup = {
          listName: result.listName
        }

        this.dataService.updateGroup(this.groupData.id, updatedGroup).subscribe({
          next: (response: any) => {
            this.groupList = response.group.Lists;
          },
          error: (err) => {
            this.snackbarService.showError(err);
          }
        });
      }
    })
  }

  replaceSpacesWithUnderscores(event: any) {
    event.target.value = event.target.value.replace(/\s+/g, '_');
  }

  resetVotes() {
    this.dataService.deleteVotesByGroup(this.groupData.id).subscribe({
      next: (response: any) => {
        this.snackbarService.showSuccess(response.message);
        this.groupData.hasVoted = false;
        this.groupMedia = this.groupMedia.map(media => {
          return { ...media, votes: [] };
        });
      },
      error: (err) => {
        this.snackbarService.showError(err);
      }
    })
  }

  hasMediaWithVotes(): boolean {
    return this.groupMedia.some(media => media.votes.length > 0);
  }
}
